import { createBlogClient, buildUrl, fetchJson } from 'blog-database-github-client';

const CMS_CONFIG = {
  repo: 'sumitpal29/sumit-pal-portfolio-database',
  branch: 'main',
  project: 'sumit-portfolio-website',
  cacheTtl: 300_000,
  useLocalStorage: false,
};

const KNOWLEDGE_BASE_CMS_CONFIG = {
  repo: 'sumitpal29/sumit-pal-portfolio-database',
  branch: 'main',
  project: 'knowledge-base',
  cacheTtl: 300_000,
  useLocalStorage: false,
};

export const blogClient = createBlogClient(CMS_CONFIG);

// Helper to fetch arbitrary JSON from the CMS, falling back to null on failure
async function fetchCmsJson<T>(filePath: string): Promise<T | null> {
  try {
    const url = buildUrl(CMS_CONFIG, filePath);
    return await fetchJson(url);
  } catch (error) {
    console.error(`[CMS] Failed to fetch ${filePath}:`, error);
    return null;
  }
}

export function buildKnowledgeBaseUrl(filePath: string): string {
  return buildUrl(KNOWLEDGE_BASE_CMS_CONFIG, filePath);
}

// Data fetching helpers for our portfolio

export interface ProfileData {
  about: string[];
  skills: string[];
  email: string;
  socials: Array<{ name: string; href: string; ariaLabel?: string }>;
}

export async function getProfileConfigs(): Promise<ProfileData | null> {
  return fetchCmsJson<ProfileData>('config/profile-config.json');
}

export interface ExperienceData {
  role: string;
  company: string;
  link: string;
  period: string;
  slug: string;
  description: string;
  responsibilities: string[];
}

export async function getExperiences(): Promise<ExperienceData[]> {
  const data = await fetchCmsJson<ExperienceData[]>('metadata/experiences.json');
  return data ?? [];
}

export interface ProjectData {
  title: string;
  description: string;
  tech: string[];
  link: string;
  github: string;
  npm?: string;
  year: string;
}

export async function getProjects(): Promise<ProjectData[]> {
  const data = await fetchCmsJson<ProjectData[]>('metadata/projects.json');
  return data ?? [];
}

export interface LabAppData {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  href: string;
  icon: string;
  tags: string[];
  status: 'live' | 'wip';
}

export async function getLabApps(): Promise<LabAppData[]> {
  // Stored at sumit-portfolio-website/metadata/lab-apps.json in the CMS repo
  const data = await fetchCmsJson<LabAppData[]>('metadata/lab-apps.json');
  return data ?? [];
}
