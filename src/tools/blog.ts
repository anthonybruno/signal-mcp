import Parser from 'rss-parser';
import { logger } from '@/utils/logger';
import { PERSONAL_CONFIG } from '@/config/constants';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
type ToolResponse = CallToolResult;
import { BlogPost } from '@/types';

class BlogService {
  private parser: Parser;

  constructor() {
    this.parser = new Parser({
      customFields: {
        item: [
          ['content:encoded', 'contentEncoded'],
          ['dc:creator', 'creator'],
          ['category', 'categories'],
        ],
      },
    });
  }

  async getLatestPost(): Promise<BlogPost | null> {
    try {
      // Use hard-coded RSS URL from constants
      const rssUrl = PERSONAL_CONFIG.blogRssUrl;

      logger.debug('Fetching latest blog post', { rssUrl });

      const feed = await this.parser.parseURL(rssUrl);

      if (!feed.items || feed.items.length === 0) {
        logger.warn('No blog posts found in RSS feed');
        return null;
      }

      // Get the most recent post (first item in the feed)
      const item = feed.items[0];

      const post: BlogPost = {
        title: item.title ?? 'Untitled',
        link: item.link ?? '',
        publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
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
}

const blogService = new BlogService();

export async function getLatestBlogPost(): Promise<ToolResponse> {
  try {
    const post = await blogService.getLatestPost();

    if (!post) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: 'No blog posts found.',
            }),
          },
        ],
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
          text: JSON.stringify({
            error: 'Sorry, I encountered an error while trying to fetch your latest blog post.',
          }),
        },
      ],
    };
  }
}
