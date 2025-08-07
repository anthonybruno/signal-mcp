import axios from 'axios';

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
  url: string;
}

function createHeaders() {
  // eslint-disable-next-line no-process-env
  const ghToken = process.env.GH_TOKEN;
  if (!ghToken) {
    logger.error('GH_TOKEN environment variable is not set');
    throw new Error('GH_TOKEN environment variable is required');
  }

  logger.debug(
    'Using GitHub token (first 10 chars):',
    `${ghToken.substring(0, 10)}...`,
  );

  return {
    Authorization: `token ${ghToken}`,
    'Content-Type': 'application/json',
  };
}

const GITHUB_QUERY = `
  query {
    user(login: "anthonybruno") {
      contributionsCollection {
        totalCommitContributions
      }
      pinnedItems(first: 6, types: REPOSITORY) {
        nodes {
          ... on Repository {
            name
            description
            url
          }
        }
      }
    }
  }
`;

function transformPinnedItems(
  nodes: (PinnedItem | null)[],
): GitHubRepository[] {
  return nodes
    .filter((node): node is PinnedItem => node !== null)
    .map((repo) => ({
      name: repo.name,
      description: repo.description,
      html_url: repo.url,
      language: undefined,
      stargazers_count: 0,
      forks_count: 0,
      homepage: undefined,
      topics: [],
      updated_at: new Date().toISOString(),
    }));
}

async function fetchGitHubData() {
  try {
    const response = await axios.post(
      'https://api.github.com/graphql',
      { query: GITHUB_QUERY },
      { headers: createHeaders() },
    );

    logger.debug('GitHub API response:', {
      status: response.status,
      data: response.data,
    });

    const userData = response.data.data?.user;
    if (!userData) {
      logger.error('GitHub API returned no user data:', response.data);
      throw new Error('Failed to fetch GitHub data - no user data returned');
    }

    return {
      user: {
        login: 'anthonybruno',
        html_url: 'https://github.com/anthonybruno',
      },
      repos: transformPinnedItems(userData.pinnedItems.nodes),
      contributions:
        userData.contributionsCollection?.totalCommitContributions || 0,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error('GitHub API request failed:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
    } else {
      logger.error('Unexpected error fetching GitHub data:', error);
    }
    throw new Error('Failed to fetch GitHub data');
  }
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
