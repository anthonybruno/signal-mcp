import axios from 'axios';

import { getEnv } from '@/config/env';
import { logger } from '@/utils/logger';

import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

interface GitHubUser {
  login: string;
  html_url: string;
  public_repos: number;
  followers: number;
  bio?: string;
  name?: string;
  company?: string;
  location?: string;
  blog?: string;
}

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

/**
 * Fetches user profile and repository data from GitHub API.
 *
 * Makes parallel requests to get both user profile information and recent repositories.
 * Uses GitHub's REST API v3 with proper authentication headers.
 *
 * @returns Promise<{user: GitHubUser, repos: GitHubRepository[]}> - User and repository data
 * @throws Error if API requests fail
 */
async function fetchGitHubData() {
  const headers = {
    Authorization: `token ${getEnv().GH_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
  };

  const [userResponse, reposResponse] = await Promise.all([
    axios.get<GitHubUser>('https://api.github.com/users/anthonybruno', { headers }),
    axios.get<GitHubRepository[]>(
      'https://api.github.com/users/anthonybruno/repos?sort=updated&per_page=6',
      { headers },
    ),
  ]);

  return {
    user: userResponse.data,
    repos: reposResponse.data,
  };
}

/**
 * Retrieves GitHub activity and profile information.
 *
 * This tool integrates with GitHub's REST API to fetch user profile data and recent
 * repositories. It provides a comprehensive view of GitHub activity including follower
 * count, repository statistics, and project details.
 *
 * @returns Promise<CallToolResult> - JSON response containing profile and repository data
 * @example
 * // Returns: { username: "anthonybruno", followers: 42, topRepos: [...], ... }
 */
export async function getGitHubActivity(): Promise<CallToolResult> {
  try {
    const { user, repos } = await fetchGitHubData();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            username: user.login,
            profileUrl: user.html_url,
            publicRepos: user.public_repos,
            followers: user.followers,
            bio: user.bio,
            topRepos: repos.map((repo) => ({
              name: repo.name,
              description: repo.description,
              url: repo.html_url,
              language: repo.language,
              stars: repo.stargazers_count,
              topics: repo.topics,
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
