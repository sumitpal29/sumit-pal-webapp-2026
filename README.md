# Developer Portfolio

A pixel-perfect, production-ready developer portfolio built with Next.js 16, TypeScript, Tailwind CSS, and Framer Motion. Features GitHub-powered content, beautiful animations, and full SEO optimization.

## Features

- ✨ **Smooth Animations**: Cursor glow effect, scroll-triggered animations, and page transitions
- 📱 **Fully Responsive**: Desktop, tablet, and mobile-optimized layout
- 🎨 **Custom Design System**: Dark theme with teal accents (#0a192f, #64ffda)
- 🔍 **SEO Optimized**: Metadata, OpenGraph tags, structured data, sitemap, and robots.txt
- 📝 **GitHub Content**: Auto-fetch projects and blog posts from your GitHub repository
- ⌨️ **Accessible**: ARIA labels, focus management, reduced motion support
- 🚀 **Performance**: Optimized images, code splitting, ISR caching

## Getting Started

### 1. Clone and Install

```bash
npm install
# or
pnpm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and update with your details:

```bash
cp .env.example .env.local
```

Fill in your configuration:
- `NEXT_PUBLIC_GITHUB_OWNER`: Your GitHub username
- `NEXT_PUBLIC_GITHUB_REPO`: Repository containing your portfolio content
- `NEXT_PUBLIC_SITE_URL`: Your portfolio domain

### 3. Set Up Content Repository

Create a GitHub repository with the following structure:

```
content/
├── projects/
│   ├── project-1.md
│   └── project-2.md
├── blog/
│   ├── post-1.md
│   └── post-2.md
└── experience/
    ├── job-1.md
    └── job-2.md
```

#### Example Project Markdown (content/projects/my-project.md):

```markdown
---
title: Project Title
description: Brief description
tech: [JavaScript, React, Node.js]
link: https://project-url.com
github: https://github.com/user/project
date: 2024-03-15
---

Project details and description goes here.
```

#### Example Blog Post (content/blog/my-post.md):

```markdown
---
title: Blog Post Title
description: Post summary
date: 2024-03-15
tags: [JavaScript, Web Development]
author: Your Name
---

# Blog Post Content

Your markdown content here...
```

#### Example Experience (content/experience/job.md):

```markdown
---
role: Senior Engineer
company: Tech Corp
companyLink: https://techcorp.com
period: 2022 - Present
responsibilities:
  - Led development of feature X
  - Improved performance by 40%
  - Mentored junior developers
---
```

### 4. Update Portfolio Config

Edit `config/portfolio.config.ts` with your information:

```typescript
export const portfolioConfig = {
  name: 'Your Name',
  title: 'Your Title',
  email: 'your@email.com',
  social: {
    github: 'https://github.com/yourname',
    linkedin: 'https://linkedin.com/in/yourname',
    twitter: 'https://twitter.com/yourname',
    codepen: 'https://codepen.io/yourname',
  },
  // ... rest of config
};
```

### 5. Run Development Server

```bash
npm run dev
# or
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your portfolio.

## Project Structure

```
├── app/
│   ├── layout.tsx           # Root layout with SEO metadata
│   ├── page.tsx             # Main portfolio page
│   ├── globals.css          # Global styles and design tokens
│   ├── sitemap.ts           # Dynamic sitemap generation
│   └── robots.ts            # Robots configuration
├── components/
│   └── portfolio/
│       ├── portfolio-layout.tsx  # Main layout wrapper
│       ├── sidebar.tsx           # Navigation sidebar
│       ├── cursor-glow.tsx       # Cursor effect
│       ├── hero.tsx              # Hero section
│       ├── about.tsx             # About section
│       ├── experience.tsx        # Experience timeline
│       ├── projects.tsx          # Projects grid
│       ├── blog.tsx              # Blog section
│       └── contact.tsx           # Contact section
├── config/
│   └── portfolio.config.ts   # Portfolio configuration
├── hooks/
│   └── use-scroll-spy.ts     # Scroll detection hook
├── lib/
│   ├── github-api.ts         # GitHub API client
│   ├── markdown-parser.ts    # Markdown → HTML parser
│   ├── seo.ts                # SEO utilities
│   └── github-content/
│       └── loader.ts         # Content fetching orchestration
└── types/
    └── content.ts            # TypeScript types
```

## Design System

### Colors
- **Background**: #0a192f (Dark navy)
- **Text**: #ccd6f6 (Light blue)
- **Primary**: #64ffda (Cyan)
- **Secondary**: #8892b0 (Gray)
- **Border**: #233554 (Navy)

### Typography
- **Fonts**: Inter (sans-serif), System fonts fallback
- **Headings**: 64px/32px/18px scale
- **Body**: 16-18px with 1.6 line-height

### Spacing
- **Base Unit**: 8px grid
- **Section Padding**: 80-128px vertical

## Customization

### Change Colors

Edit `app/globals.css` CSS variables:

```css
:root {
  --background: #0a192f;
  --primary: #64ffda;
  /* ... rest of variables */
}
```

### Update Section Text

Edit component files directly:
- Hero: `components/portfolio/hero.tsx`
- About: `components/portfolio/about.tsx`
- Experience: `components/portfolio/experience.tsx`
- Projects: `components/portfolio/projects.tsx`
- Blog: `components/portfolio/blog.tsx`
- Contact: `components/portfolio/contact.tsx`

### Customize Animations

Framer Motion animations are configured in each section component. Adjust `variants`, `transition`, and `whileHover` props to change animation behavior.

## Performance Optimization

The portfolio is optimized for performance:

- **Image Optimization**: Next.js Image component with lazy loading
- **Code Splitting**: Automatic by Next.js
- **Incremental Static Regeneration (ISR)**: Content cached for 1 hour
- **CSS-in-JS**: Tailwind CSS with zero runtime overhead
- **Cursor Canvas**: Hardware-accelerated with requestAnimationFrame

Target Lighthouse scores:
- Performance: >95
- Accessibility: >95
- SEO: >95
- Best Practices: >90

## Deployment

### Deploy to Vercel (Recommended)

1. Push to GitHub
2. Import project to Vercel
3. Set environment variables in Vercel settings
4. Deploy

### Deploy to Other Platforms

The portfolio is a standard Next.js app and works with any platform supporting Node.js:
- Netlify
- AWS Amplify
- Railway
- Render
- Digital Ocean

## Accessibility

The portfolio includes:
- Semantic HTML structure
- ARIA labels and roles
- Focus management
- Keyboard navigation support
- Reduced motion support
- Color contrast compliance

## Analytics (Optional)

The portfolio includes Vercel Analytics by default. To add additional analytics:

1. Update `.env.local` with your analytics ID
2. Install analytics package: `npm install @vercel/analytics`
3. Import in `app/layout.tsx`

## Content Updates

When you push new content to your GitHub repository:

1. Changes are automatically fetched (within cache period)
2. Portfolio rebuilds with new content
3. No manual deployment needed (with ISR enabled)

To immediately update without waiting for cache:
- Manually redeploy from Vercel dashboard
- Or set `revalidate: 0` in loader functions (less performant)

## Troubleshooting

### Content not showing up?
- Check GitHub token has proper permissions
- Verify file paths match `portfolio.config.ts`
- Ensure markdown files have proper frontmatter

### Images not loading?
- Use full URLs in markdown (`https://...`)
- Or place images in `/public` directory

### Animations not smooth?
- Check browser performance
- Reduce animations for performance testing
- Ensure no console errors

## License

This portfolio template is open source. Feel free to use it for your own portfolio!

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review GitHub Issues
3. Check Next.js documentation
4. Open an issue on GitHub

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)
- [React Documentation](https://react.dev)
