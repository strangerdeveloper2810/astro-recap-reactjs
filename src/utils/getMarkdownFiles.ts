import fs from 'fs';
import path from 'path';

export interface MarkdownFile {
  slug: string;
  title: string;
  content: string;
  path: string;
}

export function getMarkdownFiles(basePath: string): MarkdownFile[] {
  return getMarkdownFilesRecursive(basePath, basePath);
}

function getMarkdownFilesRecursive(basePath: string, currentPath: string): MarkdownFile[] {
  const files: MarkdownFile[] = [];

  if (!fs.existsSync(currentPath)) {
    return files;
  }

  const entries = fs.readdirSync(currentPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(currentPath, entry.name);

    if (entry.isDirectory()) {
      // Recursively process subdirectories, but keep the original basePath
      files.push(...getMarkdownFilesRecursive(basePath, fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const title = extractTitle(content) || entry.name.replace('.md', '');
      // Calculate relative path from the ORIGINAL basePath, not current directory
      const relativePath = path.relative(basePath, fullPath);
      const slug = relativePath.replace('.md', '').replace(/\\/g, '/');

      files.push({
        slug,
        title,
        content,
        path: fullPath,
      });
    }
  }

  return files;
}

function extractTitle(content: string): string | null {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

export function getMarkdownFile(basePath: string, slug: string): MarkdownFile | null {
  // Try different path combinations
  const possiblePaths = [
    path.join(basePath, `${slug}.md`),
    path.join(basePath, slug, 'index.md'),
    path.join(basePath, slug),
  ];

  for (const fullPath of possiblePaths) {
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      
      if (stats.isFile() && fullPath.endsWith('.md')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const relativePath = path.relative(basePath, fullPath);
        const fileSlug = relativePath.replace('.md', '').replace(/\\/g, '/');
        const title = extractTitle(content) || fileSlug;

        return {
          slug: fileSlug,
          title,
          content,
          path: fullPath,
        };
      } else if (stats.isDirectory()) {
        // Try to find index.md in directory
        const indexPath = path.join(fullPath, 'index.md');
        if (fs.existsSync(indexPath)) {
          const content = fs.readFileSync(indexPath, 'utf-8');
          const relativePath = path.relative(basePath, indexPath);
          const fileSlug = relativePath.replace('.md', '').replace(/\\/g, '/');
          const title = extractTitle(content) || fileSlug;

          return {
            slug: fileSlug,
            title,
            content,
            path: indexPath,
          };
        }
      }
    }
  }

  return null;
}

