import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST_DIR = path.join(REPO_ROOT, "dist");
const POSTS_DIR = path.join(REPO_ROOT, "src/content/blog/posts");
const SEO_BLOCK_PATTERN = /    <!-- SEO:BEGIN -->[\s\S]*?    <!-- SEO:END -->/;
const frontmatterPattern = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

const GROUPS_PATH = "src/content/blog/groups.json";
const SEO_CONFIG_PATH = "src/content/blog/seo.json";

function stripQuotes(value) {
  return String(value)
    .trim()
    .replace(/^["']|["']$/g, "");
}

function parseListValue(value) {
  if (!value.startsWith("[") || !value.endsWith("]")) return [];
  return value.slice(1, -1).split(",").map(stripQuotes).filter(Boolean);
}

function parseFrontmatter(raw, sourcePath) {
  const match = raw.match(frontmatterPattern);
  if (!match) throw new Error(`Missing frontmatter in ${sourcePath}`);

  const data = {};
  let currentListKey = null;

  for (const line of match[1].split(/\r?\n/)) {
    const listItem = line.match(/^\s*-\s+(.*)$/);
    if (listItem && currentListKey) {
      data[currentListKey].push(stripQuotes(listItem[1]));
      continue;
    }

    const divider = line.indexOf(":");
    if (divider < 1) continue;

    const key = line.slice(0, divider).trim();
    const rawValue = line.slice(divider + 1).trim();
    if (rawValue === "") {
      data[key] = [];
      currentListKey = key;
    } else if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
      data[key] = parseListValue(rawValue);
      currentListKey = null;
    } else {
      data[key] = stripQuotes(rawValue);
      currentListKey = null;
    }
  }

  return {
    body: raw.slice(match[0].length).trim(),
    data
  };
}

function requireText(data, key, sourcePath) {
  const value = data[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Missing "${key}" in ${sourcePath}`);
  }
  return value;
}

async function readJson(relativePath) {
  return JSON.parse(await fs.readFile(path.join(REPO_ROOT, relativePath), "utf8"));
}

async function readMarkdownPosts(groups) {
  const groupIds = new Set(groups.map((group) => group.id));
  const entries = await fs.readdir(POSTS_DIR, { withFileTypes: true }).catch((error) => {
    if (error.code === "ENOENT") return [];
    throw error;
  });

  const posts = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;

    const sourcePath = path.join(POSTS_DIR, entry.name);
    const raw = await fs.readFile(sourcePath, "utf8");
    const { body, data } = parseFrontmatter(raw, sourcePath);
    const group = requireText(data, "group", sourcePath);
    if (!groupIds.has(group))
      throw new Error(`Unknown group "${group}" in ${sourcePath}`);

    const content = body.replace(/^# .+(\n|$)/, "").trim();
    const charCount = content.replace(/```[\s\S]*?```/g, "").replace(/\s+/g, "").length;
    const slug = entry.name.replace(/\.md$/, "");
    const tags = Array.isArray(data.tags) ? data.tags : [];

    posts.push({
      slug,
      title: requireText(data, "title", sourcePath),
      summary: requireText(data, "summary", sourcePath),
      date: requireText(data, "date", sourcePath),
      group,
      tags,
      href: `/blog/${slug}`,
      readingMinutes: Math.max(1, Math.ceil(charCount / 500)),
      year: requireText(data, "date", sourcePath).slice(0, 4)
    });
  }

  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeXml(value) {
  return escapeHtml(value).replace(/'/g, "&apos;");
}

function escapeJsonForScript(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function siteUrl(config, routePath) {
  const origin = config.siteUrl.replace(/\/$/, "");
  return routePath === "/" ? `${origin}/` : `${origin}${routePath}`;
}

function absoluteImageUrl(config, image) {
  if (image.path.startsWith("http://") || image.path.startsWith("https://")) {
    return image.path;
  }
  return `${config.siteUrl.replace(/\/$/, "")}${image.path}`;
}

function authorJsonLd(config) {
  return {
    "@type": "Person",
    name: config.authorName,
    url: config.authorUrl
  };
}

function homeMeta(config) {
  const image = config.homeImage;
  return {
    canonical: siteUrl(config, "/"),
    description: config.homeDescription,
    image: absoluteImageUrl(config, image),
    imageAlt: image.alt,
    imageHeight: image.height,
    imageWidth: image.width,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: config.siteName,
      url: siteUrl(config, "/"),
      inLanguage: "ko-KR",
      author: authorJsonLd(config)
    },
    keywords: config.homeKeywords,
    title: config.homeTitle,
    type: "website",
    url: siteUrl(config, "/")
  };
}

function blogIndexMeta(config, posts) {
  const image = config.blogImage;
  return {
    canonical: siteUrl(config, "/blog"),
    description: config.blogDescription,
    image: absoluteImageUrl(config, image),
    imageAlt: image.alt,
    imageHeight: image.height,
    imageWidth: image.width,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: config.blogName,
      description: config.blogDescription,
      url: siteUrl(config, "/blog"),
      inLanguage: "ko-KR",
      author: authorJsonLd(config),
      blogPost: posts.slice(0, 20).map((post) => ({
        "@type": "BlogPosting",
        headline: post.title,
        url: siteUrl(config, post.href),
        datePublished: post.date
      }))
    },
    keywords: config.blogKeywords,
    title: config.blogTitle,
    type: "website",
    url: siteUrl(config, "/blog")
  };
}

function groupMeta(config, group, posts) {
  const image = config.blogImage;
  const routePath = `/blog/group/${group.id}`;
  return {
    canonical: siteUrl(config, routePath),
    description: group.description,
    image: absoluteImageUrl(config, image),
    imageAlt: image.alt,
    imageHeight: image.height,
    imageWidth: image.width,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${group.title} | ${config.blogName}`,
      description: group.description,
      url: siteUrl(config, routePath),
      inLanguage: "ko-KR",
      author: authorJsonLd(config),
      hasPart: posts.map((post) => ({
        "@type": "BlogPosting",
        headline: post.title,
        url: siteUrl(config, post.href),
        datePublished: post.date
      }))
    },
    keywords: [...config.blogKeywords, group.title],
    title: `${group.title} | ${config.blogName}`,
    type: "website",
    url: siteUrl(config, routePath)
  };
}

function articleMeta(config, post, group) {
  const image = config.blogImage;
  return {
    canonical: siteUrl(config, post.href),
    description: post.summary,
    image: absoluteImageUrl(config, image),
    imageAlt: image.alt,
    imageHeight: image.height,
    imageWidth: image.width,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.summary,
      url: siteUrl(config, post.href),
      mainEntityOfPage: siteUrl(config, post.href),
      image: absoluteImageUrl(config, image),
      datePublished: post.date,
      dateModified: post.date,
      author: authorJsonLd(config),
      publisher: authorJsonLd(config),
      articleSection: group.title,
      keywords: post.tags,
      inLanguage: "ko-KR"
    },
    keywords: post.tags.length > 0 ? post.tags : config.blogKeywords,
    publishedTime: post.date,
    tags: post.tags,
    title: `${post.title} | ${config.blogName}`,
    type: "article",
    url: siteUrl(config, post.href)
  };
}

function seoBlock(meta) {
  const keywords = Array.isArray(meta.keywords)
    ? meta.keywords.join(", ")
    : meta.keywords;
  const lines = [
    "    <!-- SEO:BEGIN -->",
    `    <title>${escapeHtml(meta.title)}</title>`,
    `    <meta name="title" content="${escapeHtml(meta.title)}" />`,
    `    <meta name="description" content="${escapeHtml(meta.description)}" />`,
    `    <meta name="keywords" content="${escapeHtml(keywords)}" />`,
    '    <meta name="author" content="kang1027" />',
    `    <meta property="og:type" content="${escapeHtml(meta.type)}" />`,
    `    <meta property="og:url" content="${escapeHtml(meta.url)}" />`,
    `    <meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `    <meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `    <meta property="og:image" content="${escapeHtml(meta.image)}" />`,
    `    <meta property="og:image:width" content="${escapeHtml(meta.imageWidth)}" />`,
    `    <meta property="og:image:height" content="${escapeHtml(meta.imageHeight)}" />`,
    `    <meta property="og:image:alt" content="${escapeHtml(meta.imageAlt)}" />`,
    '    <meta property="og:locale" content="ko_KR" />',
    '    <meta property="og:site_name" content="kang1027\'s Portfolio" />'
  ];

  if (meta.publishedTime) {
    lines.push(
      `    <meta property="article:published_time" content="${escapeHtml(meta.publishedTime)}" />`
    );
  }

  for (const tag of meta.tags ?? []) {
    lines.push(`    <meta property="article:tag" content="${escapeHtml(tag)}" />`);
  }

  lines.push(
    '    <meta name="twitter:card" content="summary_large_image" />',
    `    <meta name="twitter:url" content="${escapeHtml(meta.url)}" />`,
    `    <meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `    <meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    `    <meta name="twitter:image" content="${escapeHtml(meta.image)}" />`,
    `    <link rel="canonical" href="${escapeHtml(meta.canonical)}" />`,
    `    <script type="application/ld+json">${escapeJsonForScript(meta.jsonLd)}</script>`,
    "    <!-- SEO:END -->"
  );

  return lines.join("\n");
}

function withSeo(baseHtml, meta) {
  if (!SEO_BLOCK_PATTERN.test(baseHtml)) {
    throw new Error("SEO block markers are missing from dist/index.html");
  }

  return baseHtml
    .replace(/<html lang="[^"]*">/, '<html lang="ko">')
    .replace(SEO_BLOCK_PATTERN, seoBlock(meta));
}

async function writeRoute(routePath, html) {
  const filePath =
    routePath === "/"
      ? path.join(DIST_DIR, "index.html")
      : path.join(DIST_DIR, routePath.slice(1), "index.html");

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, html);
}

function latestDate(posts, fallback) {
  return posts.length > 0 ? posts[0].date : fallback;
}

function sitemapXml(routes) {
  const body = routes
    .map((route) => {
      return [
        "  <url>",
        `    <loc>${escapeXml(route.loc)}</loc>`,
        `    <lastmod>${escapeXml(route.lastmod)}</lastmod>`,
        `    <changefreq>${escapeXml(route.changefreq)}</changefreq>`,
        `    <priority>${escapeXml(route.priority)}</priority>`,
        "  </url>"
      ].join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

async function main() {
  const [groups, config, baseHtml] = await Promise.all([
    readJson(GROUPS_PATH),
    readJson(SEO_CONFIG_PATH),
    fs.readFile(path.join(DIST_DIR, "index.html"), "utf8")
  ]);
  const posts = await readMarkdownPosts(groups);
  const groupById = new Map(groups.map((group) => [group.id, group]));
  const today = new Date().toISOString().slice(0, 10);
  const blogLastMod = latestDate(posts, today);

  await writeRoute("/", withSeo(baseHtml, homeMeta(config)));
  await writeRoute("/blog", withSeo(baseHtml, blogIndexMeta(config, posts)));

  for (const group of groups) {
    const groupPosts = posts.filter((post) => post.group === group.id);
    await writeRoute(
      `/blog/group/${group.id}`,
      withSeo(baseHtml, groupMeta(config, group, groupPosts))
    );
  }

  for (const post of posts) {
    const group = groupById.get(post.group);
    if (!group) throw new Error(`Unknown group "${post.group}" for ${post.slug}`);
    await writeRoute(post.href, withSeo(baseHtml, articleMeta(config, post, group)));
  }

  const sitemapRoutes = [
    {
      changefreq: "monthly",
      lastmod: today,
      loc: siteUrl(config, "/"),
      priority: "0.8"
    },
    {
      changefreq: "weekly",
      lastmod: blogLastMod,
      loc: siteUrl(config, "/blog"),
      priority: "0.8"
    },
    ...groups.map((group) => {
      const groupPosts = posts.filter((post) => post.group === group.id);
      return {
        changefreq: "weekly",
        lastmod: latestDate(groupPosts, blogLastMod),
        loc: siteUrl(config, `/blog/group/${group.id}`),
        priority: groupPosts.length > 0 ? "0.7" : "0.4"
      };
    }),
    ...posts.map((post) => ({
      changefreq: "monthly",
      lastmod: post.date,
      loc: siteUrl(config, post.href),
      priority: "0.9"
    }))
  ];

  await fs.writeFile(path.join(DIST_DIR, "sitemap.xml"), sitemapXml(sitemapRoutes));
  await fs.writeFile(
    path.join(DIST_DIR, "robots.txt"),
    `User-agent: *\nAllow: /\nSitemap: ${siteUrl(config, "/sitemap.xml")}\n`
  );

  process.stdout.write(
    `Generated SEO HTML for ${groups.length + posts.length + 2} routes, ${posts.length} posts\n`
  );
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
