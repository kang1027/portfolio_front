import type {
  BlogCategory,
  BlogCategoryId,
  BlogFrontmatter,
  BlogGroup,
  BlogGroupId,
  BlogPost,
  BlogYearGroup
} from "./types";

export const blogCategories = [
  {
    id: "work",
    title: "Work Notes",
    description: "포트폴리오, 제품, 작업 방식에 대한 기록"
  },
  {
    id: "engineering",
    title: "Engineering",
    description: "구현 판단, 아키텍처, 디버깅 노트"
  },
  {
    id: "essay",
    title: "Essay",
    description: "일과 생활을 오래 보는 개인 기록"
  }
] as const satisfies readonly BlogCategory[];

export const blogGroups = [
  {
    id: "portfolio",
    title: "Portfolio",
    description: "이 포트폴리오 자체를 고치며 남긴 구조, UX, 표현 방식의 판단",
    href: "/"
  },
  {
    id: "omninews",
    title: "OmniNews",
    description: "뉴스와 RSS를 검색 가능한 개인 지식 흐름으로 보는 실험",
    href: "https://github.com/Omni-News"
  },
  {
    id: "classicmap",
    title: "ClassicMap",
    description: "클래식 음악 감상 경험을 데이터와 매칭 문제로 풀어본 기록",
    href: "https://github.com/ClassicMap"
  },
  {
    id: "personal",
    title: "Personal Note",
    description: "일과 생활을 오래 보기 위해 남기는 짧은 기준들"
  }
] as const satisfies readonly BlogGroup[];

const categoryIds = blogCategories.map((category) => category.id);
const groupIds = blogGroups.map((group) => group.id);

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

const isGroupId = (value: string): value is BlogGroupId => {
  return groupIds.includes(value as BlogGroupId);
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

  const group = requireText(metadata, "group", path);
  if (!isGroupId(group)) throw new Error(`Unknown group "${group}" in ${path}`);

  const title = requireText(metadata, "title", path);
  const date = requireText(metadata, "date", path);
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
    date,
    category,
    group,
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
    readingMinutes: Math.max(1, Math.ceil(wordCount / 260)),
    year: date.slice(0, 4)
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

export const getBlogGroup = (groupId: BlogGroupId): BlogGroup => {
  const group = blogGroups.find((item) => item.id === groupId);
  if (!group) throw new Error(`Unknown blog group "${groupId}"`);
  return group;
};

export const getBlogPost = (slug: string): BlogPost | undefined => {
  return blogPosts.find((post) => post.slug === slug);
};

export const getBlogPostsByCategory = (categoryId: BlogCategoryId): BlogPost[] => {
  return blogPosts.filter((post) => post.category === categoryId);
};

export const getBlogPostsByGroup = (groupId: BlogGroupId): BlogPost[] => {
  return blogPosts.filter((post) => post.group === groupId);
};

export const blogPostsByYear = blogPosts.reduce<BlogYearGroup[]>((groups, post) => {
  const existing = groups.find((group) => group.year === post.year);
  if (existing) {
    existing.posts.push(post);
    return groups;
  }

  groups.push({ year: post.year, posts: [post] });
  return groups;
}, []);

export type {
  BlogCategory,
  BlogCategoryId,
  BlogFrontmatter,
  BlogGroup,
  BlogGroupId,
  BlogPost,
  BlogYearGroup
};
