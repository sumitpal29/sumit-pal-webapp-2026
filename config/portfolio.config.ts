export const portfolioConfig = {
  // Personal info
  name: 'Sumit Pal',
  title: 'AI Product Builder & Staff Software Engineer ',
  description:
    'An engineer with a founder mindset, focused on high-performance applications, frontend architecture, developer platforms, and AI-powered products.',
  email: 'app.sumitp@gmail.com',

  // Social links
  social: {
    github: 'https://github.com/sumitpal29',
    linkedin: 'https://linkedin.com/in/sumitpal29',
    twitter: '',
  },

  // Site metadata
  site: {
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://sumitpal.in',
    title: 'Sumit Pal — AI Web Engineer',
    description:
      'Staff Software Engineer focused on high-performance applications, frontend architecture, developer platforms, and AI-powered ideas.',
    image: '/og-image.png',
    twitter: '@sumitpal29',
  },

  // Navigation
  navigation: [
    { name: 'About', href: '/about' },
    { name: 'Blog', href: '#blog' },
    { name: 'Lab', href: '/apps' },
    { name: 'Experience', href: '#experience' },
    { name: 'Projects', href: '#projects' },
    { name: 'Contact', href: '#contact' },
  ],

  // Legal / footer links
  legalLinks: [
    { name: 'Contact', href: '/contact' },
    { name: 'Privacy', href: '/privacy' },
    { name: 'Terms', href: '/terms' },
  ],

  // Skills
  skills: [
    'JavaScript',
    'TypeScript',
    'React',
    'Next.js',
    'Node.js',
    'PostgreSQL',
    'Tailwind CSS',
    'Framer Motion',
    'GraphQL',
    'AWS',
  ],
};
