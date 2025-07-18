# Signal MCP Server

Model Context Protocol (MCP) server that provides live data tools for the Signal chatbot, including Spotify activity, GitHub contributions, and blog posts.

## What it does

The MCP server provides real-time data access through tools:

- `get_current_spotify_track` - Current Spotify playback
- `get_github_activity` - GitHub profile and recent activity
- `get_latest_blog_post` - Latest blog post from RSS feed

## Local Development

### Prerequisites

- Node.js 20+
- Spotify API credentials
- GitHub API token
- Blog RSS feed URL

### Setup

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your API credentials.

3. Start the server:

```bash
npm run dev:http
```

The MCP server runs on port 3001.

## Production

- **URL**: https://signal-mcp.fly.dev
- **Health Check**: `GET /health`

## Tech Stack

- Node.js with TypeScript
- Express.js for HTTP transport
- Spotify Web API
- GitHub GraphQL API
- RSS parser for blog feeds
