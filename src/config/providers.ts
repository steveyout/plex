export interface Provider {
  id: string;
  name: string;
  baseUrl: string;
  enabled: boolean;
}

export const providers: Provider[] = [
  {
    id: 'vidking',
    name: 'Server 1 (VidKing Premium)',
    baseUrl: 'https://www.vidking.net',
    enabled: true,
  },
  {
    id: 'vidlink',
    name: 'Server 2 (VidLink Pro)',
    baseUrl: 'https://vidlink.pro',
    enabled: true,
  },
  {
    id: 'vidsrc_to',
    name: 'Server 3 (VIP)',
    baseUrl: 'https://vidsrc.to/embed',
    enabled: true,
  },
  {
    id: 'vidnest',
    name: 'Server 4 (VidNest)',
    baseUrl: 'https://vidnest.fun',
    enabled: true,
  },
  {
    id: 'vidfast',
    name: 'Server 5 (VidFast)',
    baseUrl: 'https://vidfast.net',
    enabled: true,
  },
  {
    id: 'videasy',
    name: 'Server 6 (VidEasy)',
    baseUrl: 'https://player.videasy.net',
    enabled: true,
  },
  {
    id: 'vidsrc_me',
    name: 'Server 7 (Vidsrc Me)',
    baseUrl: 'https://vsembed.ru/embed',
    enabled: true,
  },
  {
    id: 'vidup',
    name: 'Server 8 (Vidup)',
    baseUrl: 'https://vidup.to',
    enabled: true,
  },
  {
    id: 'rivestream',
    name: 'Server 9 (Rive)',
    baseUrl: 'https://rivestream.org/embed',
    enabled: true,
  },
];

export const DEFAULT_PROVIDER_ID = 'vidking';

/**
 * Helper to build the URL based on media type
 * Supports both Movies and TV Shows
 */
export const getEmbedUrl = (
  providerId: string,
  type: 'movie' | 'tv',
  tmdbId: string | number,
  season: number = 1,
  episode: number = 1,
  progressSeconds: number = 0
): string => {
  const selected = providers.find((p) => p.id === providerId);
  if (!selected) return '';

  if (selected.id === 'vidking') {
    let url = "";
    if (type === 'movie') {
      url = `${selected.baseUrl}/embed/movie/${tmdbId}?color=e50914`;
    } else {
      url = `${selected.baseUrl}/embed/tv/${tmdbId}/${season}/${episode}?color=e50914&nextEpisode=true&episodeSelector=true`;
    }
    if (progressSeconds > 0) {
      url += `&progress=${progressSeconds}`;
    }
    return url;
  }

  // Fallbacks for other servers
  if (type === 'movie') {
    if (selected.id === 'vidlink') {
      return `${selected.baseUrl}/movie/${tmdbId}`;
    }
    return `${selected.baseUrl}/movie/${tmdbId}`;
  }
  // For TV shows
  if (selected.id === 'vidlink') {
    return `${selected.baseUrl}/tv/${tmdbId}/${season}/${episode}`;
  }
  return `${selected.baseUrl}/tv/${tmdbId}/${season}/${episode}`;
};
