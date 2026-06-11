export type BlogCategoryId = "work" | "engineering" | "essay";
export type BlogGroupId =
  | "principles"
  | "implementation"
  | "interface"
  | "product-judgement"
  | "field-notes";

export interface BlogCategory {
  id: BlogCategoryId;
  title: string;
  description: string;
}

export interface BlogGroup {
  id: BlogGroupId;
  title: string;
  description: string;
  href?: string;
}

export interface BlogFrontmatter {
  title: string;
  summary: string;
  date: string;
  category: BlogCategoryId;
  group: BlogGroupId;
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
  year: string;
}

export interface BlogYearGroup {
  year: string;
  posts: BlogPost[];
}
