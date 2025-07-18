# Anthony Bruno MCP Server

A Model Context Protocol (MCP) server that provides tools for accessing Anthony Bruno's personal data including Spotify activity, GitHub contributions, and blog posts.

## Server Overview

- **Name**: `anthony-bruno-mcp`
- **Version**: `1.0.0`
- **Transport**: Stdio (standard MCP transport)
- **Capabilities**: Tools
- **Protocol Version**: 2024-11-05

## Available Tools

### 1. `get_current_spotify_track`

**Description**: Get the currently playing track from Anthony Bruno's Spotify account

**Parameters**: None (empty object)

**Response Format**:

```json
{
  "name": "Track Name",
  "artists": [{ "name": "Artist Name" }],
  "album": { "name": "Album Name" },
  "external_urls": { "spotify": "https://open.spotify.com/track/..." },
  "is_playing": true,
  "progress_ms": 45000,
  "item": { "duration_ms": 180000 }
}
```

**Error Response**:

```json
{
  "error": "No music is currently playing on Spotify.",
  "isPlaying": false
}
```

### 2. `get_github_activity`

**Description**: Get recent GitHub activity and profile information

**Parameters**: None (empty object)

**Response Format**:

```json
{
  "username": "anthonybruno",
  "profileUrl": "https://github.com/anthonybruno",
  "totalContributions": 150,
  "pinnedRepos": [
    {
      "name": "repo-name",
      "description": "Repository description",
      "url": "https://github.com/anthonybruno/repo-name"
    }
  ]
}
```

### 3. `get_latest_blog_post`

**Description**: Get the latest blog post from Anthony Bruno's blog

**Parameters**: None (empty object)

**Response Format**:

```json
{
  "title": "Blog Post Title",
  "link": "https://blog.example.com/post-url",
  "publishedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Response**:

```json
{
  "error": "No blog posts found."
}
```

## Prerequisites

- **Node.js**: Version 18 or higher
- **Spotify API Access**: Client ID, Client Secret, and Refresh Token
- **GitHub API Access**: Personal Access Token
- **Blog RSS Feed**: RSS feed URL

## Installation & Setup

### Local Development

#### 1. Clone and Install Dependencies

```bash
cd tonybot-mcp-server
npm install
```

#### 2. Build the Server

```bash
npm run build
```

#### 3. Set Environment Variables

Create a `.env` file in the project root:

```env
# Spotify API Configuration
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REFRESH_TOKEN=your_spotify_refresh_token

# GitHub API Configuration
GITHUB_TOKEN=your_github_token
GITHUB_USERNAME=anthonybruno

# Blog/RSS Configuration
BLOG_RSS_URL=https://your-blog.com/rss.xml

# Optional: Logging and Performance
LOG_LEVEL=info
ENABLE_CACHING=true
CACHE_TTL_SECONDS=300
RATE_LIMIT_REQUESTS_PER_MINUTE=60
```

#### 4. Start the Server

```bash
# For stdio transport (local development)
npm start

# For HTTP transport (testing)
npm run start:http
```

### Production Deployment (Fly.io)

#### Prerequisites

- [Fly.io CLI](https://fly.io/docs/hands-on/install-flyctl/) installed
- Fly.io account and authentication
- Environment variables set as Fly.io secrets

#### 1. Set Environment Variables as Secrets

```bash
# Set all required environment variables as Fly.io secrets
fly secrets set SPOTIFY_CLIENT_ID="your_spotify_client_id" --app tonybot-mcp-server
fly secrets set SPOTIFY_CLIENT_SECRET="your_spotify_client_secret" --app tonybot-mcp-server
fly secrets set SPOTIFY_REFRESH_TOKEN="your_spotify_refresh_token" --app tonybot-mcp-server
fly secrets set GITHUB_TOKEN="your_github_token" --app tonybot-mcp-server
fly secrets set GITHUB_USERNAME="anthonybruno" --app tonybot-mcp-server
fly secrets set BLOG_RSS_URL="https://your-blog.com/rss.xml" --app tonybot-mcp-server
fly secrets set NODE_ENV="production" --app tonybot-mcp-server
fly secrets set MCP_TRANSPORT="http" --app tonybot-mcp-server
```

#### 2. Deploy to Fly.io

**🚀 CRITICAL DEPLOYMENT COMMAND:**

```bash
fly deploy --config packages/mcp-server/fly.toml --app tonybot-mcp-server --no-cache --ha=false
```

**Important Notes:**

- `--no-cache`: Forces a fresh build to avoid cached dependency issues
- `--ha=false`: Disables high availability to prevent multiple machines
- `--config packages/mcp-server/fly.toml`: Specifies the MCP server's Fly.io configuration
- `--app tonybot-mcp-server`: Deploys to the specific app name

#### 3. Verify Deployment

```bash
# Check health endpoint
curl https://tonybot-mcp-server.fly.dev/health

# Expected response:
# {"status":"ok","transport":"http","timestamp":"2025-07-15T04:04:56.146Z","name":"anthony-bruno-mcp","version":"1.0.0"}

# Check app status
fly status --app tonybot-mcp-server

# View logs
fly logs --app tonybot-mcp-server
```

#### 4. Troubleshooting Deployment

If the deployment fails or the app crashes:

```bash
# Scale down to 0 machines
fly scale count 0 --app tonybot-mcp-server

# Re-add secrets (they get removed when scaling down)
fly secrets set SPOTIFY_CLIENT_ID="your_spotify_client_id" --app tonybot-mcp-server
# ... (repeat for all secrets)

# Deploy again
fly deploy --config packages/mcp-server/fly.toml --app tonybot-mcp-server --no-cache --ha=false

# Scale back up
fly scale count 1 --app tonybot-mcp-server
```

#### 5. MCP Server Endpoints

- **Health Check**: `GET /health`
- **MCP Protocol**: `POST /mcp`
- **Root Info**: `GET /`

The server runs on port 3001 and is accessible via HTTP transport for production use.

## Connecting from MCP Clients

The server uses stdio transport, which is the standard for MCP servers. Here are examples for different clients:

### Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "anthony-bruno-mcp": {
      "command": "node",
      "args": ["/path/to/tonybot-mcp-server/dist/index.js"],
      "env": {
        "SPOTIFY_CLIENT_ID": "your_spotify_client_id",
        "SPOTIFY_CLIENT_SECRET": "your_spotify_client_secret",
        "SPOTIFY_REFRESH_TOKEN": "your_spotify_refresh_token",
        "GITHUB_TOKEN": "your_github_token",
        "GITHUB_USERNAME": "anthonybruno",
        "BLOG_RSS_URL": "https://your-blog.com/rss.xml"
      }
    }
  }
}
```

### Other MCP Clients

Most MCP clients support stdio transport. The server will automatically:

1. Respond to `initialize` requests with server capabilities
2. Handle `tools/list` requests to return available tools
3. Handle `tools/call` requests to execute tools

## Testing the Server

You can test the server manually using the MCP protocol:

### 1. Initialize Request

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {},
    "clientInfo": {
      "name": "test-client",
      "version": "1.0.0"
    }
  }
}
```

### 2. List Tools Request

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list",
  "params": {}
}
```

### 3. Call Tool Request

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "get_current_spotify_track",
    "arguments": {}
  }
}
```

## Development

### Available Scripts

- `npm run dev` - Start server in development mode with hot reload
- `npm run build` - Build the TypeScript code
- `npm start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

### Project Structure

```
src/
├── config/
│   └── env.ts              # Environment configuration
├── tools/
│   ├── index.ts            # Tool registration
│   ├── spotify.ts          # Spotify API integration
│   ├── github.ts           # GitHub API integration
│   └── blog.ts             # Blog RSS integration
├── types/
│   └── mcp.ts              # MCP type definitions
├── utils/
│   └── logger.ts           # Logging utilities
└── index.ts                # Server entry point
```

## Error Handling

The server implements comprehensive error handling:

- **Tool Execution Errors**: Returns error messages in the response content
- **Authentication Errors**: Handles Spotify and GitHub API authentication failures
- **Network Errors**: Gracefully handles API timeouts and connection issues
- **Validation Errors**: Validates environment variables and input parameters

## Logging

The server uses structured logging with configurable log levels:

- `LOG_LEVEL`: Set to `error`, `warn`, `info`, or `debug` (default: `info`)
- Logs include tool calls, errors, and server lifecycle events

## Performance & Caching

The server includes optional rate limiting and caching:

- `ENABLE_CACHING`: Enable/disable caching (default: `true`)
- `CACHE_TTL_SECONDS`: Cache TTL in seconds (default: `300`)
- `RATE_LIMIT_REQUESTS_PER_MINUTE`: Rate limit (default: `60`)

## API Dependencies

- **Spotify Web API**: For current track information
- **GitHub GraphQL API**: For user activity and pinned repositories
- **RSS Parser**: For blog post fetching

## Security Considerations

- All API tokens and secrets are stored as environment variables
- No sensitive data is logged
- Rate limiting prevents abuse
- Input validation on all tool parameters

## Troubleshooting

### Common Issues

1. **Spotify Authentication Errors**: Ensure your refresh token is valid and has the required scopes
2. **GitHub API Errors**: Verify your GitHub token has the necessary permissions
3. **RSS Feed Errors**: Check that the RSS URL is accessible and valid

### Debug Mode

Enable debug logging by setting `LOG_LEVEL=debug` in your environment variables.

## License

ISC License

## Contributing

This is a personal MCP server for Anthony Bruno. For questions or issues, please open an issue in the repository.
