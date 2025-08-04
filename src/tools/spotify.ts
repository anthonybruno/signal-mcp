import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import axios from 'axios';

import { getEnv } from '@/config/env';
import { logger } from '@/utils/logger';
type ToolResponse = CallToolResult;
import type { SpotifyTrack } from '@/types';

interface SpotifyArtist {
  name: string;
}

interface SpotifyTrackResponse {
  name: string;
  artists: SpotifyArtist[];
  album: { name: string };
  external_urls: { spotify: string };
}

interface SpotifyRecentlyPlayedItem {
  track: SpotifyTrackResponse;
  played_at: string;
}

interface SpotifyRecentlyPlayedResponse {
  items: SpotifyRecentlyPlayedItem[];
}

class SpotifyService {
  private accessToken: string | null = null;
  private tokenExpiry = 0;

  private async refreshAccessToken(): Promise<string> {
    const env = getEnv();

    try {
      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: env.SPOTIFY_REFRESH_TOKEN,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
          },
        },
      );

      const accessToken = response.data.access_token; // Get the token first
      if (!accessToken) {
        throw new Error('No access token received from Spotify');
      }

      this.accessToken = accessToken; // Then assign it
      this.tokenExpiry = Date.now() + response.data.expires_in * 1000;

      logger.debug('Spotify access token refreshed');
      return accessToken; // Return the local variable, not this.accessToken
    } catch (error) {
      logger.error('Failed to refresh Spotify token:', error);
      throw new Error('Failed to authenticate with Spotify');
    }
  }

  private async getValidAccessToken(): Promise<string> {
    if (!this.accessToken || Date.now() >= this.tokenExpiry) {
      await this.refreshAccessToken();
    }
    const token = this.accessToken;
    if (!token) {
      throw new Error('Spotify access token is unexpectedly null');
    }
    return token;
  }

  async getCurrentTrack(): Promise<SpotifyTrack | null> {
    try {
      const token = await this.getValidAccessToken();

      const response = await axios.get<SpotifyRecentlyPlayedResponse>(
        'https://api.spotify.com/v1/me/player/recently-played?limit=1',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const items = response.data?.items;
      if (!items || items.length === 0) {
        return null; // No recent tracks
      }

      const played = items[0];
      const { track } = played;

      return {
        name: track.name,
        artists: track.artists.map((artist: SpotifyArtist) => ({ name: artist.name })),
        album: { name: track.album.name },
        external_urls: { spotify: track.external_urls.spotify },
        played_at: played.played_at,
      };
    } catch (error) {
      logger.error('Failed to get last played Spotify track:', error);
      throw new Error('Failed to fetch last played track from Spotify');
    }
  }
}

const spotifyService = new SpotifyService();

export async function getCurrentSpotifyTrack(): Promise<ToolResponse> {
  try {
    const track = await spotifyService.getCurrentTrack();

    if (!track) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: 'No recent Spotify tracks found.',
            }),
          },
        ],
      };
    }

    // Format response to match backend expectations
    const trackData = {
      name: track.name,
      artists: track.artists,
      album: track.album,
      external_urls: track.external_urls,
      played_at: track.played_at,
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(trackData),
        },
      ],
    };
  } catch (error) {
    logger.error('Spotify tool error:', error);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: 'Sorry, I encountered an error while trying to get your current Spotify track.',
            isPlaying: false,
          }),
        },
      ],
    };
  }
}
