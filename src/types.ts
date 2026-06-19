export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  media_type: 'movie' | 'tv';
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
  episode_run_time?: number[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  credits?: {
    cast: CastMember[];
  };
  recommendations?: {
    results: MediaItem[];
  };
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  vote_average: number;
  runtime: number | null;
}

export interface SeasonInfo {
  id: number;
  name: string;
  season_number: number;
  overview: string;
  episodes: Episode[];
}

export interface WatchlistItem {
  id: number;
  title: string;
  poster_path: string | null;
  media_type: 'movie' | 'tv';
  addedAt: string;
}

export interface PlaybackProgress {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  season?: number;
  episode?: number;
  episodeName?: string;
  progressSeconds?: number;
  durationSeconds?: number;
  poster_path: string | null;
  updatedAt: string;
}

export type NavigationTab = 'home' | 'movies' | 'tv' | 'watchlist' | 'history';
