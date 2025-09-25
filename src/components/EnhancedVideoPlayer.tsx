import React, { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import { Settings, Wifi, WifiOff, Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

type VideoPlayerProps = {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  onError?: (error: string) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
};

type QualityLevel = {
  height: number;
  width: number;
  bitrate: number;
  index: number;
};

type NetworkStats = {
  speed: number;
  bufferHealth: number;
  dropped: number;
};

export const EnhancedVideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  autoPlay = false,
  onError,
  isFullscreen,
  onToggleFullscreen
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1);
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    speed: 0,
    bufferHealth: 0,
    dropped: 0
  });

  // Detectar tipo de stream
  const detectStreamType = useCallback((url: string) => {
    if (url.includes('.m3u8') || url.includes('playlist.m3u8')) return 'hls';
    if (url.includes('.mpd')) return 'dash';
    if (url.includes('rtmp://') || url.includes('rtmps://')) return 'rtmp';
    if (url.includes('.mp4') || url.includes('.webm')) return 'native';
    if (url.includes('embed') || url.includes('iframe')) return 'embed';
    return 'unknown';
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    setQualityLevels([]);
    setCurrentQuality(-1);
    setNetworkStats({ speed: 0, bufferHealth: 0, dropped: 0 });
  }, []);

  // Monitoramento de rede
  const updateNetworkStats = useCallback(() => {
    const video = videoRef.current;
    const hls = hlsRef.current;
    
    if (!video || !hls) return;

    try {
      const buffered = video.buffered;
      const currentTime = video.currentTime;
      
      let bufferHealth = 0;
      if (buffered.length > 0) {
        for (let i = 0; i < buffered.length; i++) {
          if (currentTime >= buffered.start(i) && currentTime <= buffered.end(i)) {
            bufferHealth = buffered.end(i) - currentTime;
            break;
          }
        }
      }

      // Estimativa simples de velocidade baseada na qualidade atual
      const currentLevel = hls.currentLevel;
      const estimatedSpeed = currentLevel >= 0 && hls.levels[currentLevel] 
        ? Math.round(hls.levels[currentLevel].bitrate / 1000)
        : 0;

      setNetworkStats({
        speed: estimatedSpeed,
        bufferHealth: Math.round(bufferHealth * 10) / 10,
        dropped: 0 // Removido pois stats não está disponível na interface pública
      });
    } catch (e) {
      console.warn('Erro ao obter estatísticas:', e);
    }
  }, []);

  // Carregar mídia baseado no tipo
  const loadMedia = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    setIsLoading(true);
    setError(null);
    cleanup();

    const streamType = detectStreamType(src);

    try {
      switch (streamType) {
        case 'hls':
          await loadHLS();
          break;
        case 'dash':
          await loadDASH();
          break;
        case 'rtmp':
          handleRTMP();
          break;
        case 'embed':
          handleEmbed();
          break;
        case 'native':
          await loadNative();
          break;
        default:
          // Tentar HLS primeiro, depois nativo
          try {
            await loadHLS();
          } catch {
            await loadNative();
          }
      }
    } catch (err) {
      const errorMsg = `Erro ao carregar ${streamType.toUpperCase()}: ${err instanceof Error ? err.message : 'Erro desconhecido'}`;
      setError(errorMsg);
      onError?.(errorMsg);
      setIsLoading(false);
    }
  }, [src, detectStreamType, cleanup, onError]);

  // Carregar HLS
  const loadHLS = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
        maxBufferLength: 60,
        maxMaxBufferLength: 120,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 10,
        xhrSetup: (xhr: XMLHttpRequest) => {
          xhr.withCredentials = false;
        }
      });

      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      // Event listeners
      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        const levels: QualityLevel[] = data.levels.map((level, index) => ({
          height: level.height,
          width: level.width,
          bitrate: level.bitrate,
          index
        }));
        
        setQualityLevels([{ height: 0, width: 0, bitrate: 0, index: -1 }, ...levels]);
        setCurrentQuality(-1); // Auto
        setIsLoading(false);
        
        if (autoPlay) {
          video.play().catch(() => console.log("Reprodução automática impedida"));
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS Error:', data);
        if (data.fatal) {
          throw new Error(`HLS Fatal Error: ${data.type} - ${data.details}`);
        }
      });

      hls.on(Hls.Events.FRAG_LOADED, updateNetworkStats);
      
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari nativo
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        if (autoPlay) {
          video.play().catch(() => console.log("Reprodução automática impedida"));
        }
      });
      video.addEventListener('error', () => {
        throw new Error('Erro no Safari HLS nativo');
      });
    } else {
      throw new Error('HLS não suportado neste navegador');
    }
  }, [src, autoPlay, updateNetworkStats]);

  // Carregar DASH (básico com fallback)
  const loadDASH = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    // Tentativa básica - muitos browsers modernos suportam
    video.src = src;
    video.addEventListener('loadedmetadata', () => {
      setIsLoading(false);
      if (autoPlay) {
        video.play().catch(() => console.log("Reprodução automática impedida"));
      }
    });
    video.addEventListener('error', () => {
      throw new Error('DASH não suportado - use um player dedicado');
    });
  }, [src, autoPlay]);

  // Tratar RTMP
  const handleRTMP = useCallback(() => {
    setError('RTMP não é suportado diretamente no navegador. Use um player Flash ou aplicativo dedicado.');
    setIsLoading(false);
  }, []);

  // Tratar Embed
  const handleEmbed = useCallback(() => {
    setError('Links embed devem ser abertos diretamente. Clique no botão abaixo.');
    setIsLoading(false);
  }, []);

  // Carregar vídeo nativo
  const loadNative = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    video.src = src;
    video.addEventListener('loadedmetadata', () => {
      setIsLoading(false);
      if (autoPlay) {
        video.play().catch(() => console.log("Reprodução automática impedida"));
      }
    });
    video.addEventListener('error', () => {
      throw new Error('Formato de vídeo não suportado');
    });
  }, [src, autoPlay]);

  // Controlar qualidade
  const handleQualityChange = useCallback((qualityIndex: string) => {
    const index = parseInt(qualityIndex);
    const hls = hlsRef.current;
    
    if (hls) {
      hls.currentLevel = index;
      setCurrentQuality(index);
    }
  }, []);

  // Controles de reprodução
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  // Effects
  useEffect(() => {
    loadMedia();
    return cleanup;
  }, [loadMedia, cleanup]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => setIsMuted(video.muted);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, []);

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const resetTimeout = () => {
      clearTimeout(timeout);
      setShowControls(true);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    const handleMouseMove = () => resetTimeout();
    const handleMouseLeave = () => {
      clearTimeout(timeout);
      setShowControls(false);
    };

    resetTimeout();
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Network stats update interval
  useEffect(() => {
    const interval = setInterval(updateNetworkStats, 2000);
    return () => clearInterval(interval);
  }, [updateNetworkStats]);

  if (error) {
    return (
      <Card className="w-full" style={{ aspectRatio: "16/9" }}>
        <CardContent className="p-8 text-center h-full flex flex-col justify-center">
          <div className="text-destructive mb-4 text-xl">⚠️ Erro de Reprodução</div>
          <p className="text-sm mb-4">{error}</p>
          
          {(src.includes('embed') || src.includes('rtmp://')) && (
            <Button
              onClick={() => window.open(src, '_blank', 'noopener,noreferrer')}
              className="mx-auto"
            >
              🔗 Abrir Link Externo
            </Button>
          )}
          
          <div className="mt-4 text-xs text-muted-foreground">
            Suporte: HLS (.m3u8), MP4, WebM, DASH (.mpd)
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div 
      className="relative w-full group"
      style={{ aspectRatio: "16/9" }}
      onMouseEnter={() => setShowControls(true)}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-background/90 flex items-center justify-center rounded z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}
      
      <video
        ref={videoRef}
        poster={poster}
        className="w-full h-full rounded bg-black"
        autoPlay={autoPlay}
        playsInline
        controls={false}
      >
        Seu navegador não suporta o player de vídeo.
      </video>

      {/* Controles Customizados */}
      <div 
        className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 rounded transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Controles Centrais */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            size="lg"
            variant="ghost"
            onClick={togglePlay}
            className="bg-black/50 hover:bg-black/70 text-white rounded-full p-4"
          >
            {isPlaying ? <Pause size={32} /> : <Play size={32} />}
          </Button>
        </div>

        {/* Barra Superior - Network Stats */}
        <div className="absolute top-4 right-4 flex gap-2">
          <div className="bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            {networkStats.speed > 0 ? <Wifi size={12} /> : <WifiOff size={12} />}
            {networkStats.speed > 0 ? `${networkStats.speed} kbps` : 'N/A'}
          </div>
          <div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
            Buffer: {networkStats.bufferHealth}s
          </div>
        </div>

        {/* Barra Inferior - Controles */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4">
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleMute}
            className="text-white hover:bg-white/20 p-2"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </Button>

          <div className="flex-1" />

          {/* Seletor de Qualidade */}
          {qualityLevels.length > 1 && (
            <Select value={currentQuality.toString()} onValueChange={handleQualityChange}>
              <SelectTrigger className="w-24 bg-black/70 text-white border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-1">Auto</SelectItem>
                {qualityLevels.slice(1).map((level) => (
                  <SelectItem key={level.index} value={level.index.toString()}>
                    {level.height}p
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/20 p-2"
          >
            <Settings size={20} />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={onToggleFullscreen}
            className="text-white hover:bg-white/20 p-2"
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </Button>
        </div>
      </div>
    </div>
  );
};