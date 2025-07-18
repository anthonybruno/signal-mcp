import http from 'http';
import url from 'url';
import querystring from 'querystring';
import dotenv from 'dotenv';
import { logger } from '../src/utils/logger';

dotenv.config();

// Get credentials from environment variables
const CLIENT_ID = 'd8604747bf404cad9aeea71597b8981c';
const CLIENT_SECRET = '847aec81b1a142a899f46e2da139cb12';
const REDIRECT_URI = 'http://127.0.0.1:8888/callback';

if (!CLIENT_ID || !CLIENT_SECRET) {
  logger.error(
    '❌ Error: SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set in environment variables',
  );
  logger.error('Please add them to your .env file or export them in your shell');
  process.exit(1);
}

logger.info('Starting Spotify authentication...');
logger.info('1. Open this URL in your browser:');
logger.info(
  `https://accounts.spotify.com/authorize?${querystring.stringify({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: 'user-read-recently-played user-read-currently-playing user-read-playback-state',
    redirect_uri: REDIRECT_URI,
  })}`,
);

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url!, true);

  if (parsedUrl.pathname === '/callback') {
    const code = parsedUrl.query['code'] as string;

    if (code) {
      try {
        logger.info('Received authorization code, exchanging for tokens...');

        // Exchange code for tokens
        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
          },
          body: querystring.stringify({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
          }),
        });

        const tokens = (await tokenResponse.json()) as SpotifyTokenResponse;

        if (tokens.refresh_token) {
          logger.info('✅ Success! Add this to your .env file:', {
            refreshToken: tokens.refresh_token,
            expiresIn: tokens.expires_in,
            tokenType: tokens.token_type,
          });

          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end('<h1>Success!</h1><p>Check your terminal for the refresh token.</p>');

          server.close();
        } else {
          throw new Error('No refresh token received');
        }
      } catch (error) {
        logger.error('Error getting tokens:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        });
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<h1>Error</h1><p>Check terminal for details.</p>');
      }
    } else {
      logger.warn('No authorization code received in callback');
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end('<h1>Error</h1><p>No authorization code received.</p>');
    }
  } else {
    logger.debug('Received request for non-callback path:', { path: parsedUrl.pathname });
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>Not Found</h1>');
  }
});

server.listen(8888, () => {
  logger.info("2. After authorizing, you'll be redirected back here");
  logger.info('3. Check this terminal for your refresh token');
});

// Handle server errors
server.on('error', (error) => {
  logger.error('Server error:', error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
