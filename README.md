# Signal MCP

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP](https://img.shields.io/badge/MCP-Protocol-blue.svg)](https://modelcontextprotocol.io)
[![Spotify API](https://img.shields.io/badge/Spotify-API-1DB954?logo=spotify&logoColor=white)](https://developer.spotify.com/)

MCP-compatible server for [Signal’s](https://github.com/anthonybruno/signal) live GitHub, Spotify,
and blog integrations.

## What it does

This server handles live integrations between Signal and third-party platforms like GitHub, Spotify,
and a personal blog. Built on the [Model Context Protocol (MCP)](https://modelcontextprotocol.io),
it listens for MCP actions from the LLM and executes them via secure, scoped API calls. It’s
designed to demonstrate real-time interaction patterns between an AI layer and external data sources
using well-defined action schemas.

**Key Features:**

- GitHub activity integration
- Spotify "Now Playing" and recent history
- Blog RSS-to-JSON conversion and feed updates
- MCP-compliant message formatting

## Usage Examples

### Basic Usage

```bash
# Example: Get current Spotify track
curl -X POST http://localhost:3000 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "get_current_spotify_track",
      "arguments": {}
    }
  }'

# Response:
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "result": {
		"content": [
			{
				"type": "text",
				"text": "{\"name\":\"Stranger In A Strange Land\",\"artists\":[{\"name\":\"Leon Russell\"}],\"album\":{\"name\":\"Leon Russell And The Shelter People (Expanded Edition)\"},\"external_urls\":{\"spotify\":\"https://open.spotify.com/track/1C8VMfbSqTK6wXrmZ1MNkA\"},\"played_at\":\"2025-08-07T20:45:03.204Z\"}"
			}
		]
	}
  }
}
```

## Local Development

### Prerequisites

- Node.js 20+

### Setup

```bash
npm install
cp .env.example .env
npm run dev
```

- **URL**: http://localhost:3000
- **Health Check**: `GET /health`

## Tech Stack

- Node.js + TypeScript
- Express
- MCP SDK
- OpenRouter-compatible integration formatting

## Architecture Notes

- Exposes a single MCP-compatible endpoint for use by the Signal frontend
- Acts as a passive provider: no LLM interaction, just data enrichment
- Lightweight Express server built for streaming JSON payloads

## Development Workflow

```bash
npm run dev:http      # Start HTTP server (tsx)
npm run start:http    # Start HTTP server (tsx)
npm run type-check    # Type-check TypeScript (no emit)
npm run lint          # Run ESLint
npm run lint:fix      # Fix linting issues
npm run format        # Format code with Prettier
npm run spotify:auth  # Spotify authentication setup
```

## Signal Context

This server demonstrates external integration handling, third-party API usage, and
protocol-compliant response formatting. As part of a broader portfolio, it highlights full-stack
orchestration and system design.
