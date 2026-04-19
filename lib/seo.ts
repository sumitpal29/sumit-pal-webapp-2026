import { portfolioConfig } from '@/config/portfolio.config';

export interface OpenGraphMeta {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: string;
}

/**
 * Generate Open Graph meta tags
 */
export function generateOpenGraphMeta(meta: OpenGraphMeta) {
  return {
    'og:title': meta.title,
    'og:description': meta.description,
    'og:url': meta.url,
    'og:type': meta.type || 'website',
    'og:image': meta.image || `${portfolioConfig.site.url}/og-image.png`,
    'twitter:title': meta.title,
    'twitter:description': meta.description,
    'twitter:image': meta.image || `${portfolioConfig.site.url}/og-image.png`,
    'twitter:creator': portfolioConfig.site.twitter,
    'twitter:card': 'summary_large_image',
  };
}

/**
 * Generate JSON-LD structured data
 */
export function generateSchemaOrgData(type: 'Person' | 'BlogPosting' | 'Article' = 'Person') {
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': type,
    name: portfolioConfig.name,
    url: portfolioConfig.site.url,
    sameAs: [
      portfolioConfig.social.github,
      portfolioConfig.social.linkedin,
      portfolioConfig.social.twitter,
    ],
  };

  if (type === 'Person') {
    return {
      ...baseSchema,
      jobTitle: portfolioConfig.title,
      description: portfolioConfig.description,
      email: portfolioConfig.email,
      alumniOf: {
        '@type': 'CollegeOrUniversity',
        name: 'University Name',
      },
    };
  }

  return baseSchema;
}

/**
 * Get canonical URL
 */
export function getCanonicalUrl(path: string = ''): string {
  const url = new URL(portfolioConfig.site.url);
  if (path) {
    url.pathname = path;
  }
  return url.toString();
}

/**
 * Format metadata for a page
 */
export function formatMetadata(title: string, description?: string, image?: string) {
  const finalTitle = title ? `${title} | ${portfolioConfig.name}` : portfolioConfig.site.title;
  const finalDescription = description || portfolioConfig.site.description;

  return {
    title: finalTitle,
    description: finalDescription,
    image: image || portfolioConfig.site.image,
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      url: portfolioConfig.site.url,
      images: [
        {
          url: image || portfolioConfig.site.image,
          width: 1200,
          height: 630,
          alt: finalTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: finalTitle,
      description: finalDescription,
      creator: portfolioConfig.site.twitter,
      images: [image || portfolioConfig.site.image],
    },
  };
}
