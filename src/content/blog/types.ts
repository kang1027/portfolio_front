export type BlogCategoryId = "work" | "engineering" | "essay";

export interface BlogCategory {
  id: BlogCategoryId;
  title: string;
  icon: string;
  description: string;
}

export interface BlogFrontmatter {
  title: string;
  summary: string;
  date: string;
  category: BlogCategoryId;
  tags: string[];
  icon: string;
  project?: string;
  projectHref?: string;
}

export interface BlogPost extends BlogFrontmatter {
  slug: string;
  content: string;
  href: string;
  readingMinutes: number;
}
