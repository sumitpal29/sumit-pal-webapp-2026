import { getGitHubFile, getMarkdownFiles } from '@/lib/github-api';
import { parseMarkdown, formatDate } from '@/lib/markdown-parser';
import { portfolioConfig } from '@/config/portfolio.config';

export interface ProjectData {
  slug: string;
  title: string;
  description: string;
  tech: string[];
  link?: string;
  github?: string;
  date?: string;
  image?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  author?: string;
  content: string;
  html: string;
}

export interface Experience {
  slug: string;
  role: string;
  company: string;
  companyLink?: string;
  period: string;
  responsibilities: string[];
}

/**
 * Fetch and parse projects from GitHub
 */
export async function getProjects(): Promise<ProjectData[]> {
  try {
    const files = await getMarkdownFiles(portfolioConfig.github.contentPaths.projects);
    const projects: ProjectData[] = [];

    for (const file of files) {
      const content = await getGitHubFile(file.path);
      const parsed = parseMarkdown(content);

      const slug = file.name.replace('.md', '');
      const project: ProjectData = {
        slug,
        title: (parsed.frontMatter.title as string) || slug,
        description: (parsed.frontMatter.description as string) || '',
        tech: (parsed.frontMatter.tech as string[]) || [],
        link: (parsed.frontMatter.link as string) || undefined,
        github: (parsed.frontMatter.github as string) || undefined,
        date: (parsed.frontMatter.date as string) || undefined,
        image: (parsed.frontMatter.image as string) || undefined,
      };

      projects.push(project);
    }

    return projects.sort((a, b) => {
      // Sort by date if available, otherwise by title
      if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return a.title.localeCompare(b.title);
    });
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return [];
  }
}

/**
 * Fetch and parse blog posts from GitHub
 */
export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const files = await getMarkdownFiles(portfolioConfig.github.contentPaths.blog);
    const posts: BlogPost[] = [];

    for (const file of files) {
      const content = await getGitHubFile(file.path);
      const parsed = parseMarkdown(content);

      const slug = file.name.replace('.md', '');
      const post: BlogPost = {
        slug,
        title: (parsed.frontMatter.title as string) || slug,
        description: (parsed.frontMatter.description as string) || '',
        date: formatDate((parsed.frontMatter.date as string) || new Date()),
        tags: (parsed.frontMatter.tags as string[]) || [],
        author: (parsed.frontMatter.author as string) || undefined,
        content: parsed.content,
        html: parsed.html,
      };

      posts.push(post);
    }

    return posts.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    return [];
  }
}

/**
 * Fetch and parse experience from GitHub
 */
export async function getExperience(): Promise<Experience[]> {
  try {
    const files = await getMarkdownFiles(portfolioConfig.github.contentPaths.experience);
    const experiences: Experience[] = [];

    for (const file of files) {
      const content = await getGitHubFile(file.path);
      const parsed = parseMarkdown(content);

      const slug = file.name.replace('.md', '');
      const experience: Experience = {
        slug,
        role: (parsed.frontMatter.role as string) || '',
        company: (parsed.frontMatter.company as string) || '',
        companyLink: (parsed.frontMatter.companyLink as string) || undefined,
        period: (parsed.frontMatter.period as string) || '',
        responsibilities: (parsed.frontMatter.responsibilities as string[]) || [],
      };

      experiences.push(experience);
    }

    return experiences;
  } catch (error) {
    console.error('Failed to fetch experience:', error);
    return [];
  }
}

/**
 * Get a single blog post by slug
 */
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const content = await getGitHubFile(`${portfolioConfig.github.contentPaths.blog}/${slug}.md`);
    const parsed = parseMarkdown(content);

    return {
      slug,
      title: (parsed.frontMatter.title as string) || slug,
      description: (parsed.frontMatter.description as string) || '',
      date: formatDate((parsed.frontMatter.date as string) || new Date()),
      tags: (parsed.frontMatter.tags as string[]) || [],
      author: (parsed.frontMatter.author as string) || undefined,
      content: parsed.content,
      html: parsed.html,
    };
  } catch (error) {
    console.error(`Failed to fetch blog post ${slug}:`, error);
    return null;
  }
}
