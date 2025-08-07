import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
type ToolResponse = CallToolResult;

export function getProjectInfo(): Promise<ToolResponse> {
  return Promise.resolve({
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          name: 'Signal - AI Portfolio Chatbot',
          description:
            'Signal is an AI-powered portfolio chatbot that showcases my ability to architect, lead, and deliver modern, production-grade systems. It drives personalized, context-aware conversations by combining live data integrations, advanced AI, and a robust RAG and MCP backend.\n\nBuilt for clarity, scale, and real-world use, TonyBot reflects my commitment to secure, maintainable software and the leadership mindset I bring to every team I support.',
          technologies: [
            '**Frontend:** Next.js with React for the chat interface, styled with Tailwind and written in TypeScript',
            '**Backend:** Express.js with ChromaDB for Retrieval-Augmented Generation (RAG) using OpenAI embeddings and semantic search',
            '**LLM Routing:** OpenRouter for dynamic model orchestration across providers like Gemini, GPT, and Claude',
            '**Live Tools (MCP):** Model Context Protocol server with custom tools for real-time data from Spotify, GitHub, and RSS feeds',
            '**Production Infrastructure:** Winston for logging, Helmet for security, and express-rate-limit for basic rate limiting',
            '**Containerization:** Dockerized frontend, backend, and vector store components for local development and deployability',
          ],
          url: 'https://github.com/example/ipsumbot',
        }),
      },
    ],
  });
}
