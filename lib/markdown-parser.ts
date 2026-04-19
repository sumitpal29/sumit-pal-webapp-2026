interface FrontMatter {
  [key: string]: unknown;
}

export interface ParsedMarkdown {
  frontMatter: FrontMatter;
  content: string;
  html: string;
}

/**
 * Parse YAML-style frontmatter from markdown
 * Supports format:
 * ---
 * title: My Title
 * date: 2024-01-01
 * ---
 * Content here
 */
function parseFrontMatter(content: string): {
  frontMatter: FrontMatter;
  content: string;
} {
  const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontMatterRegex);

  if (!match) {
    return {
      frontMatter: {},
      content,
    };
  }

  const frontMatterString = match[1];
  const contentString = match[2];
  const frontMatter: FrontMatter = {};

  // Parse simple YAML key: value pairs
  const lines = frontMatterString.split('\n');
  for (const line of lines) {
    if (!line.trim()) continue;

    const [key, ...valueParts] = line.split(':');
    const value = valueParts.join(':').trim();

    // Parse different data types
    if (value === 'true') {
      frontMatter[key.trim()] = true;
    } else if (value === 'false') {
      frontMatter[key.trim()] = false;
    } else if (value.match(/^\d+$/)) {
      frontMatter[key.trim()] = parseInt(value);
    } else if (value.startsWith('[') && value.endsWith(']')) {
      // Simple array parsing
      frontMatter[key.trim()] = value
        .slice(1, -1)
        .split(',')
        .map((v) => v.trim().replace(/^['"]|['"]$/g, ''));
    } else {
      frontMatter[key.trim()] = value.replace(/^['"]|['"]$/g, '');
    }
  }

  return {
    frontMatter,
    content: contentString,
  };
}

/**
 * Convert markdown to basic HTML
 * Supports:
 * - Headers (# - ######)
 * - Bold (**text**)
 * - Italic (*text*)
 * - Links [text](url)
 * - Code blocks (```lang\ncode\n```)
 * - Inline code (`code`)
 * - Lists (- item)
 */
export function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Code blocks
  html = html.replace(
    /```([\w]*)\n([\s\S]*?)```/g,
    '<pre><code class="language-$1">$2</code></pre>'
  );

  // Headers
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr />');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Inline code
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');

  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>');
  html = `<p>${html}</p>`;

  // Lists
  html = html.replace(/^- (.*?)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*?<\/li>)/s, '<ul>$1</ul>');

  return html;
}

/**
 * Parse markdown file content
 */
export function parseMarkdown(content: string): ParsedMarkdown {
  const { frontMatter, content: markdownContent } = parseFrontMatter(content);
  const html = markdownToHtml(markdownContent);

  return {
    frontMatter,
    content: markdownContent,
    html,
  };
}

/**
 * Format date string
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
