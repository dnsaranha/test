// Utilitários para processar e categorizar mídias

export type MediaType = 'tv' | 'movie' | 'series';

export type MediaItem = {
  id: string;
  name: string;
  url: string;
  logo: string;
  category: string;
  type: MediaType;
  description?: string;
  genre?: string;
  year?: string;
  rating?: string;
};

// Função para detectar o tipo de mídia baseado no nome e categoria
export function detectMediaType(name: string, category: string): MediaType {
  const nameUpper = name.toUpperCase();
  const categoryUpper = category.toUpperCase();
  
  // Detectar TV/Canais
  if (
    categoryUpper.includes('GLOBO') ||
    categoryUpper.includes('RECORD') ||
    categoryUpper.includes('BAND') ||
    categoryUpper.includes('SBT') ||
    categoryUpper.includes('CANAIS') ||
    nameUpper.includes('TV ') ||
    nameUpper.includes('GLOBO') ||
    nameUpper.includes('RECORD') ||
    nameUpper.includes('BAND') ||
    nameUpper.includes('SBT') ||
    nameUpper.includes('CNN') ||
    nameUpper.includes('NEWS')
  ) {
    return 'tv';
  }
  
  // Detectar Séries
  if (
    nameUpper.includes('SÉRIE') ||
    nameUpper.includes('SERIES') ||
    nameUpper.includes('TEMPORADA') ||
    nameUpper.includes('SEASON') ||
    nameUpper.includes('CSI') ||
    nameUpper.includes('NCIS') ||
    nameUpper.includes('MACGYVER') ||
    categoryUpper.includes('SÉRIE') ||
    categoryUpper.includes('SERIES') ||
    categoryUpper.includes('DRAMA') ||
    categoryUpper.includes('COMÉDIA') ||
    categoryUpper.includes('AÇÃO')
  ) {
    return 'series';
  }
  
  // Detectar Filmes
  if (
    nameUpper.includes('FILME') ||
    nameUpper.includes('MOVIE') ||
    nameUpper.includes('CINEMA') ||
    categoryUpper.includes('FILME') ||
    categoryUpper.includes('CINE') ||
    categoryUpper.includes('TERROR') ||
    categoryUpper.includes('ROMANCE') ||
    categoryUpper.includes('SUSPENSE') ||
    categoryUpper.includes('CLÁSSICO')
  ) {
    return 'movie';
  }
  
  // Por padrão, considerar como TV se não conseguir determinar
  return 'tv';
}

// Função para processar lista M3U (versão melhorada)
export function parseM3U(content: string): MediaItem[] {
  const mediaItems: MediaItem[] = [];
  if (!content || !content.includes('#EXTM3U')) {
    console.warn("Conteúdo M3U inválido ou ausente.");
    return mediaItems;
  }

  const lines = content.split('\n');
  let currentItem: Partial<MediaItem> & { TvgId?: string, TvgName?: string } = {};

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('#EXTINF:')) {
      // Resetar para um novo item
      currentItem = {};

      const nameMatch = trimmedLine.split(',').pop();
      currentItem.name = nameMatch?.trim() || 'Canal sem nome';

      const logoMatch = trimmedLine.match(/tvg-logo="([^"]+)"/);
      currentItem.logo = logoMatch ? logoMatch[1] : 'https://via.placeholder.com/100x100?text=TV';

      const groupMatch = trimmedLine.match(/group-title="([^"]+)"/);
      currentItem.category = groupMatch ? groupMatch[1] : 'Geral';

      const TvgIdMatch = trimmedLine.match(/tvg-id="([^"]+)"/);
      currentItem.TvgId = TvgIdMatch ? TvgIdMatch[1] : undefined;

      const TvgNameMatch = trimmedLine.match(/tvg-name="([^"]+)"/);
      currentItem.TvgName = TvgNameMatch ? TvgNameMatch[1] : undefined;

    } else if (trimmedLine && !trimmedLine.startsWith('#')) {
      // Esta é a linha da URL
      if (currentItem.name) {
        currentItem.url = trimmedLine;
        currentItem.id = `${currentItem.name}-${currentItem.url}`;
        currentItem.type = detectMediaType(currentItem.name, currentItem.category || 'Geral');

        // Pular canais informativos ou sem conteúdo real
        const lowerName = currentItem.name.toLowerCase();
        if (
          lowerName.includes('informações') ||
          lowerName.includes('doação') ||
          lowerName.includes('whats') ||
          lowerName.includes('atualizado') ||
          lowerName.includes('forum') ||
          currentItem.url.includes('abre.ai') ||
          currentItem.url.includes('short.gy')
        ) {
          // Resetar e continuar para o próximo
          currentItem = {};
          continue;
        }

        mediaItems.push(currentItem as MediaItem);
        // Resetar para o próximo ciclo
        currentItem = {};
      }
    }
  }

  return mediaItems;
}

// Função para processar XML do Pluto TV
export function parseXML(content: string): MediaItem[] {
  const mediaItems: MediaItem[] = [];
  
  try {
    // Buscar por elementos channel no XML
    const channelMatches = content.match(/<channel[^>]*>[\s\S]*?<\/channel>/g);
    
    if (channelMatches) {
      channelMatches.forEach((channelBlock) => {
        const idMatch = channelBlock.match(/id="([^"]+)"/);
        const nameMatch = channelBlock.match(/<display-name>([^<]+)<\/display-name>/);
        const iconMatch = channelBlock.match(/<icon src="([^"]+)"/);
        
        if (idMatch && nameMatch) {
          const id = idMatch[1];
          const name = nameMatch[1];
          const logo = iconMatch ? iconMatch[1] : 'https://via.placeholder.com/100x100?text=TV';
          
          const type = detectMediaType(name, name);
          
          mediaItems.push({
            id,
            name,
            url: `pluto://${id}`, // URL placeholder para Pluto TV
            logo,
            category: 'Pluto TV',
            type
          });
        }
      });
    }
  } catch (error) {
    console.error('Erro ao processar XML:', error);
  }
  
  return mediaItems;
}

// Função para filtrar mídias por tipo
export function filterMediaByType(mediaItems: MediaItem[], type: MediaType): MediaItem[] {
  return mediaItems.filter(item => item.type === type);
}

// Função para filtrar mídias por categoria
export function filterMediaByCategory(mediaItems: MediaItem[], categories: string[]): MediaItem[] {
  if (categories.length === 0) return mediaItems;
  return mediaItems.filter(item => categories.includes(item.category));
}

// Função para obter todas as categorias únicas
export function getUniqueCategories(mediaItems: MediaItem[]): string[] {
  const categories = new Set(mediaItems.map(item => item.category));
  return Array.from(categories).sort();
}