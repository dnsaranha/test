import React, { createContext, useContext, ReactNode } from 'react';
import { useMediaLoad } from '@/hooks/useMediaLoad';
import { useMediaSettings } from '@/hooks/useMediaSettings';
import { useAuth } from '@/hooks/useAuth';
import { MediaItem } from '@/utils/mediaParser';

interface MediaContextType {
  allMedia: MediaItem[];
  loading: boolean;
  reloadMedia: () => void;
  mediaCounts: {
    tv: number;
    movie: number;
    series: number;
  };
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export const useMediaContext = () => {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error('useMediaContext must be used within a MediaProvider');
  }
  return context;
};

interface MediaProviderProps {
  children: ReactNode;
}

export const MediaProvider: React.FC<MediaProviderProps> = ({ children }) => {
  const { getActiveSources, removeDuplicates, loading: settingsLoading } = useMediaSettings();
  const { allMedia, loading: mediaLoading, reloadMedia } = useMediaLoad({
    sources: getActiveSources,
    removeDuplicates
  });

  // Contar itens por tipo
  const mediaCounts = React.useMemo(() => ({
    tv: allMedia.filter(item => item.type === 'tv').length,
    movie: allMedia.filter(item => item.type === 'movie').length,
    series: allMedia.filter(item => item.type === 'series').length
  }), [allMedia]);

  return (
    <MediaContext.Provider value={{
      allMedia,
      loading: mediaLoading || settingsLoading,
      reloadMedia,
      mediaCounts
    }}>
      {children}
    </MediaContext.Provider>
  );
};