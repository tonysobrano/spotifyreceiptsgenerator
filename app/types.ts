export type TimeRange = 'short_term' | 'medium_term' | 'long_term';

export interface SpotifyArtist {
  id: string;
  name: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  duration_ms: number;
  artists: SpotifyArtist[];
}

export interface TopTracksResponse {
  items: SpotifyTrack[];
}
