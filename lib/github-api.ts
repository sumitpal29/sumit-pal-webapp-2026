import { portfolioConfig } from '@/config/portfolio.config';

export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: 'file' | 'dir';
  content?: string;
  encoding?: string;
}

export interface GitHubContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  content: string;
  encoding: string;
}

const GITHUB_API_BASE = 'https://api.github.com/repos';
const { github } = portfolioConfig;

const headers = {
  'Accept': 'application/vnd.github.v3.raw',
  ...(github.token && { Authorization: `token ${github.token}` }),
};

/**
 * Get contents of a file from GitHub
 */
export async function getGitHubFile(path: string): Promise<string> {
  const url = `${GITHUB_API_BASE}/${github.owner}/${github.repo}/contents/${path}`;

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github.v3.raw',
      ...(github.token && { Authorization: `token ${github.token}` }),
    },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
  }

  return response.text();
}

/**
 * List files in a directory from GitHub
 */
export async function listGitHubFiles(dirPath: string): Promise<GitHubFile[]> {
  const url = `${GITHUB_API_BASE}/${github.owner}/${github.repo}/contents/${dirPath}`;

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      ...(github.token && { Authorization: `token ${github.token}` }),
    },
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    if (response.status === 404) {
      return [];
    }
    throw new Error(`Failed to list ${dirPath}: ${response.statusText}`);
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    return [];
  }

  return data;
}

/**
 * Get all markdown files from a directory
 */
export async function getMarkdownFiles(dirPath: string): Promise<GitHubFile[]> {
  const files = await listGitHubFiles(dirPath);
  return files.filter((file) => file.name.endsWith('.md') && file.type === 'file');
}
