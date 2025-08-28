import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
type ProjectInfoResponse = CallToolResult;

export function getProjectInfo(): Promise<ProjectInfoResponse> {
  return Promise.resolve({
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          name: 'Signal – An Interactive AI Portfolio',
          description:
            'Signal is a conversational portfolio designed to show how I build, structure, and ship modern engineering systems. Instead of a static page, it lets you explore my work, leadership, and background through dialogue.',
          overview:
            "Behind the scenes, Signal isn't just a demo — it's a real, production-grade system that brings together multiple services, shared configuration, and modern AI patterns. It demonstrates both my technical depth and my focus on clarity, maintainability, and team enablement.",
          keyHighlights: [
            'Interactive frontend built with Next.js, React, and Tailwind — creating a polished, accessible chat interface.',
            'Backend services powered by Express and ChromaDB for Retrieval-Augmented Generation (RAG), enabling context-aware responses.',
            'LLM routing through OpenRouter, orchestrating models like GPT, Claude, and Gemini for the right balance of cost, speed, and accuracy.',
            'Live integrations with GitHub, Spotify, and blog content via a Model Context Protocol (MCP) server, showing how AI systems can blend static knowledge with live data.',
            'Production-grade practices including structured logging (Winston), security middleware (Helmet), and rate limiting.',
            'Portable architecture with Dockerized services for easy development and deployment.',
          ],
          whyItMatters: [
            'It demonstrates my frontend expertise in creating clean, usable interfaces.',
            'It reflects my engineering management mindset by showing clear boundaries, shared standards, and strong documentation.',
            "And it highlights my ability to evaluate and integrate emerging technologies in a way that's practical and future-looking.",
          ],
          url: 'https://github.com/anthonybruno/signal',
        }),
      },
    ],
  });
}
