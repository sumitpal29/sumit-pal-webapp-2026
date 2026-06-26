import { MetadataRoute } from 'next';
import { portfolioConfig } from '@/config/portfolio.config';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = portfolioConfig.site.url;

  return {
    rules: [
      {
        // All well-behaved crawlers — full access to public content
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',          // internal API routes
          '/_next/',        // Next.js build assets (already blocked by convention but explicit is safer)
          '/admin',
        ],
      },
      {
        // Block AI training and scraping crawlers — no SEO value, protect content
        userAgent: [
          'GPTBot',           // OpenAI training
          'ChatGPT-User',     // OpenAI browsing
          'Google-Extended',  // Gemini/Bard training
          'CCBot',            // Common Crawl (feeds most AI datasets)
          'ClaudeBot',        // Anthropic training
          'Claude-Web',       // Anthropic browsing
          'anthropic-ai',
          'Bytespider',       // ByteDance / TikTok
          'Amazonbot',        // Amazon Alexa training
          'Applebot-Extended', // Apple AI training (Applebot for search is fine)
          'meta-externalagent', // Meta AI training
          'FacebookBot',
          'Omgilibot',
        ],
        disallow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
