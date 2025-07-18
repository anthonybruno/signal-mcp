# Build stage to install dependencies
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install ALL dependencies
RUN npm ci

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV MCP_TRANSPORT=http

# Create user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Copy package files
COPY package.json package-lock.json* ./

# Install ONLY production dependencies + tsx
RUN npm ci --only=production && \
    npm install tsx && \
    npm cache clean --force && \
    rm -rf /root/.npm /tmp/*

# Copy source code (but exclude unnecessary files)
COPY --chown=nodejs:nodejs src ./src
COPY --chown=nodejs:nodejs tsconfig.json ./

USER nodejs

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Run TypeScript directly with tsx
CMD ["npx", "tsx", "src/http.ts"]