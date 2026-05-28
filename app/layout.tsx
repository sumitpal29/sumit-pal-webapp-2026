import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { GoogleAnalytics } from '@next/third-parties/google'
import { portfolioConfig } from '@/config/portfolio.config'
import { ThemeProvider } from '@/components/portfolio/theme-provider'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: portfolioConfig.site.title,
    template: `%s | ${portfolioConfig.name}`,
  },
  description: portfolioConfig.site.description,
  keywords: [
    'developer',
    'full-stack',
    'engineer',
    'portfolio',
    'web development',
    'javascript',
    'typescript',
    'react',
  ],
  authors: [
    {
      name: portfolioConfig.name,
      url: portfolioConfig.site.url,
    },
  ],
  creator: portfolioConfig.name,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: portfolioConfig.site.url,
    title: portfolioConfig.site.title,
    description: portfolioConfig.site.description,
    siteName: portfolioConfig.name,
    images: [
      {
        url: portfolioConfig.site.image,
        width: 1200,
        height: 630,
        alt: portfolioConfig.site.title,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: portfolioConfig.site.title,
    description: portfolioConfig.site.description,
    creator: portfolioConfig.site.twitter,
    images: [portfolioConfig.site.image],
  },
  alternates: { canonical: portfolioConfig.site.url },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', rel: 'shortcut icon' },
      { url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: portfolioConfig.name,
  url: portfolioConfig.site.url,
  jobTitle: portfolioConfig.title,
  description: portfolioConfig.description,
  email: portfolioConfig.email,
  sameAs: [
    portfolioConfig.social.github,
    portfolioConfig.social.linkedin,
  ].filter(Boolean),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <ThemeProvider>
          {children}
          <Analytics />
        </ThemeProvider>
        <GoogleAnalytics gaId="G-6FJG6LJXCT" />
      </body>
    </html>
  )
}
