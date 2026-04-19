import { MetadataRoute } from 'next';
import { portfolioConfig } from '@/config/portfolio.config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/_private'],
    },
    sitemap: `${portfolioConfig.site.url}/sitemap.xml`,
  };
}
