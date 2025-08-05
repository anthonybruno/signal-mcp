import Parser from 'rss-parser';

import { logger } from '@/utils/logger';

import type { CallToolResult } from '@modelcontextprotocol/sdk/types';

interface BlogPost {
  title: string;
  link: string;
  publishedAt: string;
}

const RSS_URL = 'https://eastsycamore.com/rss.xml';

const parser = new Parser({
  customFields: {
    item: [
      ['content:encoded', 'contentEncoded'],
      ['dc:creator', 'creator'],
      ['category', 'categories'],
    ],
  },
});

/**
 * Fetches the latest blog post from the RSS feed.
 *
 * Parses the RSS feed to extract the most recent blog post. Handles missing
 * data gracefully by providing fallback values for title and publication date.
 *
 * @returns Promise<BlogPost | null> - The latest blog post or null if none found
 * @throws Error if RSS feed cannot be fetched or parsed
 */
async function fetchLatestBlogPost(): Promise<BlogPost | null> {
  try {
    logger.debug('Fetching latest blog post', { url: RSS_URL });
    const feed = await parser.parseURL(RSS_URL);

    if (!feed.items.length) {
      logger.warn('No blog posts found in RSS feed');
      return null;
    }

    const [latestPost] = feed.items;
    const post: BlogPost = {
      title: latestPost.title ?? 'Untitled',
      link: latestPost.link ?? '',
      publishedAt: latestPost.pubDate
        ? new Date(latestPost.pubDate).toISOString()
        : new Date().toISOString(),
    };

    logger.debug('Successfully fetched latest blog post', {
      title: post.title,
      publishedAt: post.publishedAt,
    });
    return post;
  } catch (error) {
    logger.error('Failed to fetch blog post:', error);
    throw new Error('Failed to fetch blog post from RSS feed');
  }
}

/**
 * Retrieves the latest blog post from the personal blog.
 *
 * This tool integrates with the blog's RSS feed to fetch the most recent post.
 * It provides a clean interface for accessing blog content through the MCP server,
 * handling RSS parsing and data transformation automatically.
 *
 * @returns Promise<CallToolResult> - JSON response containing blog post details or error
 */
export async function getLatestBlogPost(): Promise<CallToolResult> {
  try {
    const post = await fetchLatestBlogPost();

    if (!post) {
      return {
        content: [{ type: 'text', text: JSON.stringify({ error: 'No blog posts found' }) }],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            title: post.title,
            link: post.link,
            publishedAt: post.publishedAt,
          }),
        },
      ],
    };
  } catch (error) {
    logger.error('Blog tool error:', error);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: 'Failed to fetch blog post' }),
        },
      ],
    };
  }
}
