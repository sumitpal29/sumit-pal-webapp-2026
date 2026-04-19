export const portfolioConfig = {
  // Personal info
  name: 'Sumit Pal',
  title: 'Staff Software Engineer',
  description:
    'Staff Software Engineer focused on high-performance applications, frontend architecture, developer platforms, and AI-powered ideas.',
  email: 'sumitpal.2993@gmail.com',

  // Social links
  social: {
    github: 'https://github.com/sumitpal29',
    linkedin: 'https://linkedin.com/in/sumitpal29',
    twitter: '',
  },

  // Site metadata
  site: {
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://sumitpal.in',
    title: 'Sumit Pal — Staff Software Engineer',
    description:
      'Staff Software Engineer focused on high-performance applications, frontend architecture, developer platforms, and AI-powered ideas.',
    image: '/og-image.png',
    twitter: '@sumitpal29',
  },

  // Navigation
  navigation: [
    { name: 'About', href: '#about' },
    { name: 'Experience', href: '#experience' },
    { name: 'Projects', href: '#projects' },
    { name: 'Blog', href: '#blog' },
    { name: 'Contact', href: '#contact' },
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
