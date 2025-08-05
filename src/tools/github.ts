import axios from 'axios';

import { getEnv } from '@/config/env';
import { logger } from '@/utils/logger';

import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

interface GitHubRepository {
  name: string;
  description?: string;
  html_url: string;
  language?: string;
  stargazers_count: number;
  forks_count: number;
  homepage?: string;
  topics: string[];
  updated_at: string;
}

interface PinnedItem {
  name: string;
  description?: string;
  htmlUrl: string;
}

function createHeaders() {
  return {
    Authorization: `token ${getEnv().GH_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

const GITHUB_QUERY = `
  query {
    user(login: "anthonybruno") {
      contributionsCollection {
        totalContributions
      }
      pinnedItems(first: 6, types: REPOSITORY) {
        nodes {
          ... on Repository {
            name
            description
            htmlUrl
          }
        }
      }
    }
  }
`;

function transformPinnedItems(nodes: (PinnedItem | null)[]): GitHubRepository[] {
  return nodes
    .filter((node): node is PinnedItem => node !== null)
    .map((repo) => ({
      name: repo.name,
      description: repo.description,
      html_url: repo.htmlUrl,
      language: undefined,
      stargazers_count: 0,
      forks_count: 0,
      homepage: undefined,
      topics: [],
      updated_at: new Date().toISOString(),
    }));
}

async function fetchGitHubData() {
  const response = await axios.post(
    'https://api.github.com/graphql',
    { query: GITHUB_QUERY },
    { headers: createHeaders() },
  );

  const userData = response.data.data?.user;
  if (!userData) {
    throw new Error('Failed to fetch GitHub data');
  }

  return {
    user: {
      login: 'anthonybruno',
      html_url: 'https://github.com/anthonybruno',
    },
    repos: transformPinnedItems(userData.pinnedItems.nodes),
    contributions: userData.contributionsCollection?.totalContributions || 0,
  };
}

/**
 * Fetches GitHub activity including contributions and pinned repositories
 */
export async function getGitHubActivity(): Promise<CallToolResult> {
  try {
    const { user, repos, contributions } = await fetchGitHubData();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            username: user.login,
            profileUrl: user.html_url,
            totalContributions: contributions,
            pinnedRepos: repos.map((repo) => ({
              name: repo.name,
              description: repo.description,
              url: repo.html_url,
              language: repo.language,
              stars: repo.stargazers_count,
            })),
          }),
        },
      ],
    };
  } catch (error) {
    logger.error('Failed to fetch GitHub data:', error);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: 'Failed to get GitHub activity' }),
        },
      ],
    };
  }
}
