export interface FrontMatter {
  title: string;
  description?: string;
  date?: string;
  tags?: string[];
  [key: string]: unknown;
}

export interface ParsedContent {
  slug: string;
  frontMatter: FrontMatter;
  content: string;
  html: string;
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

export interface Project {
  slug: string;
  title: string;
  description: string;
  tech: string[];
  link?: string;
  github?: string;
  date?: string;
  image?: string;
}

export interface ExperienceItem {
  slug: string;
  role: string;
  company: string;
  companyLink?: string;
  period: string;
  responsibilities: string[];
}

export interface Portfolio {
  name: string;
  title: string;
  description: string;
  email: string;
  social: {
    github: string;
    linkedin: string;
    twitter: string;
    codepen: string;
  };
  site: {
    url: string;
    title: string;
    description: string;
    image: string;
    twitter: string;
  };
}
