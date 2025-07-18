import axios from 'axios';
import { getEnv } from '@/config/env';
import { logger } from '@/utils/logger';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
type ToolResponse = CallToolResult;

interface GitHubRepository {
  name: string;
  description?: string;
  primaryLanguage?: {
    name: string;
    color: string;
  };
  stargazerCount: number;
  forkCount: number;
  url: string;
  homepageUrl?: string;
  updatedAt: string;
  repositoryTopics?: {
    nodes: Array<{
      topic: {
        name: string;
      };
    }>;
  };
}

interface GitHubContributionsCollection {
  totalCommitContributions: number;
  totalIssueContributions: number;
  totalPullRequestContributions: number;
  totalPullRequestReviewContributions: number;
  totalRepositoryContributions: number;
  commitContributionsByRepository: Array<{
    repository: {
      name: string;
      url: string;
      isPrivate: boolean;
    };
    contributions: {
      totalCount: number;
    };
  }>;
  issueContributionsByRepository: Array<{
    repository: {
      name: string;
      url: string;
      isPrivate: boolean;
    };
    contributions: {
      totalCount: number;
    };
  }>;
  pullRequestContributionsByRepository: Array<{
    repository: {
      name: string;
      url: string;
      isPrivate: boolean;
    };
    contributions: {
      totalCount: number;
    };
  }>;
  pullRequestReviewContributionsByRepository: Array<{
    repository: {
      name: string;
      url: string;
      isPrivate: boolean;
    };
    contributions: {
      totalCount: number;
    };
  }>;
}

interface GitHubGraphQLError {
  message: string;
}

class GitHubService {
  private getHeaders() {
    const env = getEnv();
    return {
      Authorization: `token ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'tonybot-mcp-server',
    };
  }

  async getPinnedRepositories(): Promise<GitHubRepository[]> {
    const env = getEnv();
    // GitHub GraphQL query to get pinned repositories
    const query = `
      query {
        user(login: "${env.GITHUB_USERNAME}") {
          pinnedItems(first: 6, types: REPOSITORY) {
            nodes {
              ... on Repository {
                name
                description
                primaryLanguage {
                  name
                  color
                }
                stargazerCount
                forkCount
                url
                homepageUrl
                updatedAt
                repositoryTopics(first: 5) {
                  nodes {
                    topic {
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    try {
      const response = await axios.post(
        'https://api.github.com/graphql',
        { query },
        {
          headers: { ...this.getHeaders(), 'Content-Type': 'application/json' },
        },
      );

      if (response.data.errors) {
        logger.error('GraphQL errors:', response.data.errors);
        throw new Error(
          `GraphQL errors: ${response.data.errors.map((e: GitHubGraphQLError) => e.message).join(', ')}`,
        );
      }

      return response.data.data.user.pinnedItems.nodes;
    } catch (error) {
      logger.error('GraphQL request failed:', error);
      throw error;
    }
  }

  async getContributions(days: number = 365): Promise<GitHubContributionsCollection> {
    const env = getEnv();
    const endDate = new Date();
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // GraphQL query to get comprehensive contribution data
    const query = `
      query {
        user(login: "${env.GITHUB_USERNAME}") {
          contributionsCollection(from: "${startDate.toISOString()}", to: "${endDate.toISOString()}") {
            totalCommitContributions
            totalIssueContributions
            totalPullRequestContributions
            totalPullRequestReviewContributions
            totalRepositoryContributions
            commitContributionsByRepository(maxRepositories: 10) {
              repository {
                name
                url
                isPrivate
              }
              contributions {
                totalCount
              }
            }
            issueContributionsByRepository(maxRepositories: 10) {
              repository {
                name
                url
                isPrivate
              }
              contributions {
                totalCount
              }
            }
            pullRequestContributionsByRepository(maxRepositories: 10) {
              repository {
                name
                url
                isPrivate
              }
              contributions {
                totalCount
              }
            }
            pullRequestReviewContributionsByRepository(maxRepositories: 10) {
              repository {
                name
                url
                isPrivate
              }
              contributions {
                totalCount
              }
            }
          }
        }
      }
    `;

    try {
      const response = await axios.post(
        'https://api.github.com/graphql',
        { query },
        {
          headers: { ...this.getHeaders(), 'Content-Type': 'application/json' },
        },
      );

      if (response.data.errors) {
        logger.error('GraphQL errors:', response.data.errors);
        throw new Error(
          `GraphQL errors: ${response.data.errors.map((e: GitHubGraphQLError) => e.message).join(', ')}`,
        );
      }

      return response.data.data.user.contributionsCollection;
    } catch (error) {
      logger.error('GraphQL contributions request failed:', error);
      throw error;
    }
  }
}

const githubService = new GitHubService();

export async function getGitHubActivity(): Promise<ToolResponse> {
  try {
    const env = getEnv();

    const [pinnedRepos, contributions] = await Promise.all([
      githubService.getPinnedRepositories(),
      githubService.getContributions(365),
    ]);

    // Calculate total contributions from all sources
    const totalContributions =
      contributions.totalCommitContributions +
      contributions.totalIssueContributions +
      contributions.totalPullRequestContributions +
      contributions.totalPullRequestReviewContributions +
      contributions.totalRepositoryContributions;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            username: env.GITHUB_USERNAME,
            profileUrl: `https://github.com/${env.GITHUB_USERNAME}`,
            totalContributions,
            pinnedRepos: pinnedRepos.map((repo: GitHubRepository) => ({
              name: repo.name,
              description: repo.description,
              url: repo.url,
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
