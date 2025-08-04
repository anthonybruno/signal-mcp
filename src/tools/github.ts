import axios from 'axios';

import { getEnv } from '@/config/env';
import { logger } from '@/utils/logger';

import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
type ToolResponse = CallToolResult;

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

export async function getGitHubActivity(): Promise<ToolResponse> {
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
    logger.error('GitHub tool error:', error);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: 'Sorry, I encountered an error while trying to get your GitHub activity.',
          }),
        },
      ],
    };
  }
}
