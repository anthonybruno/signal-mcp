import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
type ProjectInfoResponse = CallToolResult;

export function getProjectInfo(): Promise<ProjectInfoResponse> {
  return Promise.resolve({
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          name: 'Signal – Because static portfolios are boring',
          description:
            'Signal is my portfolio (yeah, I still have [a static one too](https://studies.abruno.net)), but built as a conversation instead of a static page. You can ask about my background, leadership style, projects, or even what I’m listening to, and Signal will answer with context pulled from real data.',
          overview:
            'Behind the scenes, it’s a production-grade system that ties together multiple services and modern AI patterns:',
          keyHighlights: [
            '**Frontend:** Next.js and Tailwind for a polished, accessible chat interface',
            '**Backend:** Express with ChromaDB for Retrieval-Augmented Generation (RAG), grounding responses in context',
            '**Model routing:** OpenRouter orchestrating Gemini for the right balance of speed, cost, and accuracy',
            '**Live data:** GitHub, Spotify, and blog integrations through a Model Context Protocol (MCP) server',
            '**Ops:** Dockerized services with structured logging (Winston), security middleware (Helmet), and rate limiting',
          ],
          whyItMatters:
            'Signal is both portfolio and proof point. It shows my frontend depth, my ability to design clean and maintainable systems, and my approach to leadership through clarity, shared standards, and documentation. It also highlights how I evaluate and integrate emerging technologies in ways that are practical, future-facing, and a little bit of fun.',
          url: 'https://github.com/anthonybruno/signal',
        }),
      },
    ],
  });
}
