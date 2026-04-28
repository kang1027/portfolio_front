import type { PostingFrontmatter } from "~/types";

export interface ParsedMarkdown {
  content: string;
  frontmatter: PostingFrontmatter | null;
}

/**
 * Parse markdown with frontmatter using regex (browser-compatible)
 */
export const parseMarkdown = (text: string): ParsedMarkdown => {
  try {
    // Match frontmatter between --- delimiters
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
    const match = text.match(frontmatterRegex);

    if (match) {
      // Extract frontmatter content
      const frontmatterText = match[1];
      // Remove frontmatter from content
      const content = text.replace(frontmatterRegex, '');

      // Parse YAML-like frontmatter
      const frontmatter: any = {};
      const lines = frontmatterText.split('\n');

      for (const line of lines) {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          let value = line.substring(colonIndex + 1).trim();

          // Remove quotes
          value = value.replace(/^["']|["']$/g, '');

          // Parse arrays
          if (value.startsWith('[') && value.endsWith(']')) {
            frontmatter[key] = value
              .slice(1, -1)
              .split(',')
              .map(v => v.trim().replace(/^["']|["']$/g, ''));
          } else {
            frontmatter[key] = value;
          }
        }
      }

      return {
        content: fixImageURL(content),
        frontmatter: frontmatter as PostingFrontmatter
      };
    }

    // No frontmatter found
    return {
      content: fixImageURL(text),
      frontmatter: null
    };
  } catch (error) {
    console.error("Error parsing markdown:", error);
    return {
      content: fixImageURL(text),
      frontmatter: null
    };
  }
};

/**
 * Fix image URLs in markdown content
 */
export const fixImageURL = (text: string): string => {
  text = text.replace(/&nbsp;/g, "");
  return text;
};

/**
 * Fetch and parse markdown file (async version for BlogPostPage)
 */
export const fetchMarkdown = async (url: string): Promise<ParsedMarkdown> => {
  try {
    const response = await fetch(url);
    const text = await response.text();
    return parseMarkdown(text);
  } catch (error) {
    console.error("Error fetching markdown:", error);
    return {
      content: "",
      frontmatter: null
    };
  }
};
