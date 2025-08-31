# Signal MCP

![Model Context Protocol](https://img.shields.io/badge/MCP-Model%20Context%20Protocol-000?logo=modelcontextprotocol&logoColor=white&style=flat-square)

### Static portfolios are boring.

The Model Context Protocol (MCP) server powers Signal’s live integrations. It connects the system to
GitHub activity, Spotify listening history, and blog content, providing real-time data that makes
the portfolio feel alive.

## What it does

The MCP server is a lightweight Express service that:

- Handles **GitHub activity integration**
- Connects to Spotify for “Now Playing” and recent history
- Converts blog RSS feeds into consumable JSON
- Exposes **MCP-compliant endpoints** so the backend can call tools through OpenRouter

It doesn’t interact with models directly. Instead, it responds when the backend orchestrates a tool
call, returning structured data that can be streamed back into the conversation.

## Architecture overview

![Signal Architecture](https://github.com/user-attachments/assets/9ae777bb-9564-4168-8e72-9ffbc743ae5c)

The MCP server acts as Signal’s live data provider, bridging the system to external APIs.

## Tech stack

- **Runtime:** Node.js
- **Framework:** Express
- **Protocol:** Model Context Protocol (MCP) SDK
- **Integrations:** GitHub REST API, Spotify Web API, Blog RSS feed
- **Dev tooling:** ESLint, Prettier, Husky, and shared configs via
  [dev-config](https://www.npmjs.com/package/abruno-dev-config)

## Local development

Signal’s services can be run locally, but setup involves multiple moving parts.  
For now, the easiest way to explore Signal is the [live demo](https://signal.abruno.net).

Future work may include a simplified `docker-compose` flow for local development.

## Explore

- [Overview repo](https://github.com/anthonybruno/signal)
- [Backend repo](https://github.com/anthonybruno/signal-backend)
- [Frontend repo](https://github.com/anthonybruno/signal-frontend)
- [RAG repo](https://github.com/anthonybruno/signal-rag)
- [Live demo](https://signal.abruno.net)

## Signal context

The MCP server reflects how I approach **integration boundaries and system interoperability**. By
isolating third-party APIs behind a single protocol-compliant service, the architecture stays
modular and secure. This design makes it easier for teams to extend or swap integrations without
affecting the rest of the system. This is a principle I carry into larger engineering projects.
