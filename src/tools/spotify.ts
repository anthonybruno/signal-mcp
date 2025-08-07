import axios from 'axios';

import { getEnv } from '@/config/env';
import { logger } from '@/utils/logger';

import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

interface SpotifyTrack {
  name: string;
  artists: { name: string }[];
  album: { name: string };
  external_urls: { spotify: string };
  played_at: string;
}

/**
 * Fetches a fresh Spotify access token using the refresh token flow.
 * This is required because Spotify access tokens expire after 1 hour.
 *
 * @returns Promise<string> - The fresh access token
 * @throws Error if token refresh fails
 */
async function getSpotifyAccessToken(): Promise<string> {
  const env = getEnv();
  const tokenResponse = await axios.post(
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
  return tokenResponse.data.access_token;
}

/**
 * Retrieves the most recently played track from Spotify.
 *
 * This tool integrates with Spotify's Web API to fetch the user's recently played tracks
 * and returns the most recent one. It handles token refresh automatically and provides
 * a clean interface for the MCP server.
 *
 * @returns Promise<CallToolResult> - JSON response containing track details or error
 */
export async function getCurrentSpotifyTrack(): Promise<CallToolResult> {
  try {
    const accessToken = await getSpotifyAccessToken();
    const { items: recentTracks } = (
      await axios.get(
        'https://api.spotify.com/v1/me/player/recently-played?limit=1',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      )
    ).data;

    if (!recentTracks?.length) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: 'No recent Spotify tracks found' }),
          },
        ],
      };
    }

    const [mostRecentTrack] = recentTracks;
    const { track } = mostRecentTrack;
    const spotifyTrack: SpotifyTrack = {
      name: track.name,
      artists: track.artists.map((artist: { name: string }) => ({
        name: artist.name,
      })),
      album: { name: track.album.name },
      external_urls: { spotify: track.external_urls.spotify },
      played_at: mostRecentTrack.played_at,
    };

    return { content: [{ type: 'text', text: JSON.stringify(spotifyTrack) }] };
  } catch (error) {
    logger.error('Failed to fetch Spotify track:', error);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: 'Failed to get Spotify track' }),
        },
      ],
    };
  }
}
