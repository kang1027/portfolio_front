import type {
  BlogFrontmatter,
  BlogGroup,
  BlogGroupId,
  BlogPost,
  BlogYearGroup
} from "./types";

export const blogGroups = [
  {
    id: "dev",
    title: "설계와 구현",
    description: "직접 만들며 남긴 설계 판단, 구현 디테일, 디버깅 기록."
  },
  {
    id: "essay",
    title: "생각과 질문",
    description: "일과 삶에서 길어 올린 질문을 천천히 따라가는 글."
  },
  {
    id: "review",
    title: "읽기와 보기",
    description: "책, 영화, 시리즈를 보고 남긴 감상."
  },
  {
    id: "meetup",
    title: "견문과 모임",
    description: "세미나, 강연, 모임에서 보고 들은 것을 정리한 후기."
  },
  {
    id: "memoir",
    title: "해의 회고",
    description: "한 해를 닫으며 남기는 회고."
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
  // 한국어 기준 분당 약 500자(공백 제외)로 읽기 시간 계산
  const charCount = content.replace(/```[\s\S]*?```/g, "").replace(/\s+/g, "").length;

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
    readingMinutes: Math.max(1, Math.ceil(charCount / 500)),
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
