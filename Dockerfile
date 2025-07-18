# =============================================================================
# TonyBot MCP Server - Optimized Production Dockerfile
# =============================================================================

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for dependency installation
COPY package.json package-lock.json* ./
COPY packages/mcp-server/package.json ./packages/mcp-server/

# Install all dependencies (including dev dependencies for building)
RUN npm ci

# Copy source code
COPY packages/mcp-server ./packages/mcp-server

# Build the application with proper path resolution
WORKDIR /app/packages/mcp-server
RUN npm run build

# Verify build output
RUN ls -la dist/

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodeuser

# Copy package files
COPY --from=builder /app/packages/mcp-server/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built application
COPY --from=builder --chown=nodeuser:nodejs /app/packages/mcp-server/dist ./dist

# Verify the built files
RUN ls -la dist/

USER nodeuser

EXPOSE 3001
ENV NODE_ENV=production
ENV PORT=3001
ENV MCP_TRANSPORT=http

CMD ["node", "dist/http.js"]