import type { BlogCategory, BlogCategoryId, BlogFrontmatter, BlogPost } from "./types";

export const blogCategories = [
  {
    id: "work",
    title: "Work Notes",
    icon: "i-fa-solid:briefcase",
    description: "포트폴리오, 제품, 작업 방식에 대한 기록"
  },
  {
    id: "engineering",
    title: "Engineering",
    icon: "i-fa-solid:code",
    description: "구현 판단, 아키텍처, 디버깅 노트"
  },
  {
    id: "essay",
    title: "Essay",
    icon: "i-fa-solid:heart",
    description: "일과 생활을 오래 보는 개인 기록"
  }
] as const satisfies readonly BlogCategory[];

const categoryIds = blogCategories.map((category) => category.id);

const rawPosts = import.meta.glob<string>("./posts/*.md", {
  eager: true,
  import: "default",
  query: "?raw"
});

const frontmatterPattern = /^---\n([\s\S]*?)\n---\n?/;

const stripQuotes = (value: string): string => {
  return value.trim().replace(/^["']|["']$/g, "");
};

const parseListValue = (value: string): string[] => {
  if (!value.startsWith("[") || !value.endsWith("]")) return [];

  return value.slice(1, -1).split(",").map(stripQuotes).filter(Boolean);
};

const parseScalarMap = (source: string): Record<string, string | string[]> => {
  return source.split("\n").reduce<Record<string, string | string[]>>((result, line) => {
    const divider = line.indexOf(":");
    if (divider < 1) return result;

    const key = line.slice(0, divider).trim();
    const rawValue = line.slice(divider + 1).trim();
    result[key] = rawValue.startsWith("[")
      ? parseListValue(rawValue)
      : stripQuotes(rawValue);
    return result;
  }, {});
};

const isCategoryId = (value: string): value is BlogCategoryId => {
  return categoryIds.includes(value as BlogCategoryId);
};

const requireText = (
  map: Record<string, string | string[]>,
  key: keyof BlogFrontmatter,
  path: string
): string => {
  const value = map[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Missing "${key}" in ${path}`);
  }
  return value;
};

const parsePost = (path: string, raw: string): BlogPost => {
  const match = raw.match(frontmatterPattern);
  if (!match) throw new Error(`Missing frontmatter in ${path}`);

  const metadata = parseScalarMap(match[1]);
  const category = requireText(metadata, "category", path);
  if (!isCategoryId(category))
    throw new Error(`Unknown category "${category}" in ${path}`);

  const title = requireText(metadata, "title", path);
  const slug = path.replace("./posts/", "").replace(/\.md$/, "");
  const rawContent = raw.replace(frontmatterPattern, "").trim();
  const content = rawContent.replace(/^# .+(\n|$)/, "").trim();
  const wordCount = content
    .replace(/```[\s\S]*?```/g, "")
    .split(/\s+/)
    .filter(Boolean).length;

  return {
    slug,
    title,
    summary: requireText(metadata, "summary", path),
    date: requireText(metadata, "date", path),
    category,
    tags: Array.isArray(metadata.tags) ? metadata.tags : [],
    icon: requireText(metadata, "icon", path),
    project:
      typeof metadata.project === "string" && metadata.project.length > 0
        ? metadata.project
        : undefined,
    projectHref:
      typeof metadata.projectHref === "string" && metadata.projectHref.length > 0
        ? metadata.projectHref
        : undefined,
    content,
    href: `/blog/${slug}`,
    readingMinutes: Math.max(1, Math.ceil(wordCount / 260))
  };
};

export const blogPosts = Object.entries(rawPosts)
  .map(([path, raw]) => parsePost(path, raw))
  .sort((a, b) => b.date.localeCompare(a.date));

export const getBlogCategory = (categoryId: BlogCategoryId): BlogCategory => {
  const category = blogCategories.find((item) => item.id === categoryId);
  if (!category) throw new Error(`Unknown blog category "${categoryId}"`);
  return category;
};

export const getBlogPost = (slug: string): BlogPost | undefined => {
  return blogPosts.find((post) => post.slug === slug);
};

export const getBlogPostsByCategory = (categoryId: BlogCategoryId): BlogPost[] => {
  return blogPosts.filter((post) => post.category === categoryId);
};

export type { BlogCategory, BlogCategoryId, BlogFrontmatter, BlogPost };
