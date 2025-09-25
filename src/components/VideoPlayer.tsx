
import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

/**
 * Player de vídeo que suporta MP4 e HLS (.m3u8) via hls.js.
 */
type VideoPlayerProps = {
  src: string;
  poster?: string;
  autoPlay?: boolean;
};

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster, autoPlay = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    if (src && (src.endsWith(".m3u8") || src.includes('.m3u8?'))) {
      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (autoPlay) {
            video.play().catch(() => console.log("A reprodução automática foi impedida pelo navegador."));
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Para Safari e outros navegadores que suportam HLS nativamente
        video.src = src;
        video.addEventListener('loadedmetadata', () => {
          if (autoPlay) {
            video.play().catch(() => console.log("A reprodução automática foi impedida pelo navegador."));
          }
        });
      }
    } else {
      // Fonte de vídeo padrão (ex: MP4)
      video.src = src;
    }
    
    // Limpeza ao desmontar o componente
    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src, autoPlay]);

  return (
    <video
      ref={videoRef}
      controls
      poster={poster}
      className="w-full rounded shadow"
      style={{ aspectRatio: "16/9", background: "#111" }}
      autoPlay={autoPlay}
      playsInline // Essencial para iOS
    >
      Seu navegador não suporta o player de vídeo.
    </video>
  );
};
