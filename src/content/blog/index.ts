import type {
  BlogFrontmatter,
  BlogGroup,
  BlogGroupId,
  BlogPost,
  BlogYearGroup
} from "./types";

export const blogGroups = [
  {
    id: "principles",
    title: "원리와 구조",
    description: "기능 이름보다 먼저 문제의 원리, 데이터 흐름, 구조를 보는 글."
  },
  {
    id: "implementation",
    title: "구현과 디버깅",
    description: "직접 만들며 마주친 구현 디테일, 버그, 성능 문제를 남긴 기록."
  },
  {
    id: "interface",
    title: "인터페이스와 사용감",
    description: "화면, 글, 도구가 사용자의 맥락과 감각을 바꾸는 방식."
  },
  {
    id: "product-judgement",
    title: "제품 판단",
    description: "기능을 넣고 빼는 기준, 방향, 우선순위를 정리한 글."
  },
  {
    id: "field-notes",
    title: "견문과 기록",
    description: "보고 들은 것, 모임, 일상에서 개발 기준으로 이어진 기록."
  }
] as const satisfies readonly BlogGroup[];

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

export const getBlogGroup = (groupId: BlogGroupId): BlogGroup => {
  const group = blogGroups.find((item) => item.id === groupId);
  if (!group) throw new Error(`Unknown blog group "${groupId}"`);
  return group;
};

export const getBlogPost = (slug: string): BlogPost | undefined => {
  return blogPosts.find((post) => post.slug === slug);
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

export type { BlogFrontmatter, BlogGroup, BlogGroupId, BlogPost, BlogYearGroup };
