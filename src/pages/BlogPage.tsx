import BlogMeta from "~/components/blog/BlogMeta";
import BlogVinyl from "~/components/blog/BlogVinyl";
import MarkdownArticle from "~/components/blog/MarkdownArticle";
import SEO from "~/components/SEO";
import {
  blogGroups,
  blogPosts,
  getBlogGroup,
  getBlogPost,
  getBlogPostsByGroup,
  type BlogPost
} from "~/content/blog";

interface BlogPageProps {
  pathname: string;
}

const siteUrl = "https://www.kang1027.com";

const shortDateFormatter = new Intl.DateTimeFormat("ko-KR", {
  month: "short",
  day: "numeric"
});

const fullDateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "numeric",
  day: "numeric"
});

type BlogRoute =
  | { view: "index" }
  | { view: "group"; groupId: string }
  | { view: "post"; slug: string };

const parseBlogRoute = (pathname: string): BlogRoute => {
  const cleaned = pathname.replace(/\/+$/, "");
  if (cleaned === "/blog") return { view: "index" };

  const groupMatch = cleaned.match(/^\/blog\/group\/([^/]+)$/);
  if (groupMatch) return { view: "group", groupId: groupMatch[1] };

  const postMatch = cleaned.match(/^\/blog\/([^/]+)$/);
  if (postMatch) return { view: "post", slug: postMatch[1] };

  return { view: "index" };
};

// 인덱스에서 갈래당 보여줄 최근 글 수 — 넘치면 갈래 페이지로 안내
const indexThreadLimit = 6;

type BlogTheme = "light" | "dark";

interface BlogThemeProps {
  theme: BlogTheme;
  onToggleTheme: () => void;
}

function BlogThemeToggle({ theme, onToggleTheme }: BlogThemeProps) {
  return (
    <button
      type="button"
      className="blog-theme-toggle"
      aria-pressed={theme === "dark"}
      onClick={onToggleTheme}
    >
      {theme === "dark" ? "밝게" : "어둡게"}
    </button>
  );
}

function BlogCornerNav({ theme, onToggleTheme }: BlogThemeProps) {
  return (
    <nav className="blog-corner-nav" aria-label="블로그 내비게이션">
      <a href="/blog">글 목록</a>
      <a href="/">포트폴리오</a>
      <BlogThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
    </nav>
  );
}

function BlogPostRow({ post, compact = false }: { post: BlogPost; compact?: boolean }) {
  return (
    <a href={post.href} className={compact ? "blog-archive-row" : "blog-post-row"}>
      <time dateTime={post.date} className="blog-post-date">
        {compact
          ? shortDateFormatter.format(new Date(post.date))
          : fullDateFormatter.format(new Date(post.date))}
      </time>
      <span className="blog-post-title">{post.title}</span>
    </a>
  );
}

function BlogSideRail({ theme, onToggleTheme }: BlogThemeProps) {
  return (
    <aside className="blog-side" aria-label="견현사제">
      <nav className="blog-side-nav" aria-label="블로그 내비게이션">
        <a href="/">포트폴리오</a>
        <BlogThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
      </nav>

      <div className="blog-side-title-wrap">
        <h1 className="blog-side-title" aria-label="견현사제(見賢思齊)" />
      </div>

      <div>
        <BlogVinyl />
        <figure className="blog-hero-quote">
          <blockquote className="blog-hero-copy">
            “어진 사람을 보면 어떻게 그와 같아질까를 생각하며, 어질지 못한 사람을 보면
            속으로 스스로 반성해야 한다.”
          </blockquote>
          <figcaption>— 논어(論語) · 이인(里仁)</figcaption>
        </figure>
        <p className="blog-side-author">
          <span>강동현</span>
          <a href="https://github.com/kang1027" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href="mailto:kang3171611@naver.com">메일</a>
        </p>
      </div>
    </aside>
  );
}

function BlogFooter() {
  return (
    <footer className="blog-site-footer">
      <div>
        <p className="blog-footer-name">강동현</p>
        <p className="blog-footer-motto">
          見賢思齊 — 어진 것을 보면 같아지기를 생각하며 만들고 적는 개발자.
        </p>
        <nav className="blog-footer-links" aria-label="외부 링크">
          <a href="/">포트폴리오</a>
          <a href="https://github.com/kang1027" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href="mailto:kang3171611@naver.com">메일</a>
        </nav>
      </div>
    </footer>
  );
}

function BlogThreadSections() {
  return (
    <section id="threads" aria-label="갈래별 글">
      {blogGroups.map((group) => {
        const posts = getBlogPostsByGroup(group.id);
        if (posts.length === 0) return null;

        const visiblePosts = posts.slice(0, indexThreadLimit);
        const hasMore = posts.length > indexThreadLimit;

        return (
          <section key={group.id} id={`thread-${group.id}`} className="blog-thread-block">
            <h2>{group.title}</h2>
            <div className="blog-thread-posts">
              {visiblePosts.map((post) => (
                <BlogPostRow key={post.slug} post={post} />
              ))}
            </div>
            {hasMore && (
              <p className="blog-thread-more">
                <a href={`/blog/group/${group.id}`}>전체 {posts.length}편 보기 →</a>
              </p>
            )}
          </section>
        );
      })}
    </section>
  );
}

function BlogGroupPage({ groupId }: { groupId: string }) {
  const group = blogGroups.find((item) => item.id === groupId);
  if (!group) return <BlogNotFound />;

  const posts = getBlogPostsByGroup(group.id);
  const yearGroups = posts.reduce<{ year: string; posts: BlogPost[] }[]>(
    (groups, post) => {
      const existing = groups.find((item) => item.year === post.year);
      if (existing) {
        existing.posts.push(post);
        return groups;
      }
      groups.push({ year: post.year, posts: [post] });
      return groups;
    },
    []
  );

  return (
    <main className="blog-main">
      <SEO
        title={`${group.title} | Writings`}
        description={group.description}
        url={`${siteUrl}/blog/group/${group.id}`}
        keywords={`kang1027, blog, ${group.title}`}
      />

      <div className="blog-article-shell">
        <nav className="blog-breadcrumb" aria-label="Breadcrumb">
          <a href="/blog">Writings</a>
          <span>/</span>
          <span>{group.title}</span>
        </nav>

        <header className="blog-article-header">
          <h1>{group.title}</h1>
          <p>{group.description}</p>
        </header>

        {yearGroups.map((yearGroup) => (
          <section key={yearGroup.year} className="blog-year-block">
            <h2>{yearGroup.year}</h2>
            <div className="blog-year-rows">
              {yearGroup.posts.map((post) => (
                <BlogPostRow key={post.slug} post={post} compact />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

function BlogIndex({ theme, onToggleTheme }: BlogThemeProps) {
  return (
    <main className="blog-index-shell">
      <SEO
        title="Writings | kang1027's Portfolio"
        description="견현사제의 태도로 남기는 강동현의 프로젝트 판단, 구현 노트, 개인 기록."
        url={`${siteUrl}/blog`}
        keywords="kang1027, portfolio, blog, engineering notes, writing"
      />

      <BlogSideRail theme={theme} onToggleTheme={onToggleTheme} />
      <div className="blog-content-col">
        <BlogThreadSections />
      </div>
    </main>
  );
}

function BlogArticle({ post }: { post: BlogPost }) {
  const group = getBlogGroup(post.group);
  const relatedPosts = getBlogPostsByGroup(post.group)
    .filter((relatedPost) => relatedPost.slug !== post.slug)
    .slice(0, 3);
  const fallbackPosts = blogPosts
    .filter((relatedPost) => relatedPost.slug !== post.slug)
    .slice(0, 3);
  const nextPosts = relatedPosts.length > 0 ? relatedPosts : fallbackPosts;

  return (
    <main className="blog-main">
      <SEO
        title={`${post.title} | Writings`}
        description={post.summary}
        url={`${siteUrl}${post.href}`}
        keywords={post.tags.join(", ")}
        type="article"
        publishedTime={post.date}
        tags={post.tags}
      />

      <article className="blog-article-shell">
        <nav className="blog-breadcrumb" aria-label="Breadcrumb">
          <a href="/blog">Writings</a>
          <span>/</span>
          <a href={`/blog/group/${group.id}`}>{group.title}</a>
        </nav>

        <header className="blog-article-header">
          <h1>{post.title}</h1>
          <p>{post.summary}</p>
          <div className="blog-article-meta">
            <BlogMeta post={post} />
          </div>
          <div className="blog-tag-list" aria-label="Tags">
            {post.tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        </header>

        <MarkdownArticle content={post.content} className="blog-markdown" />

        {nextPosts.length > 0 && (
          <footer className="blog-related">
            <h2>같이 읽기</h2>
            <div>
              {nextPosts.map((relatedPost) => (
                <BlogPostRow key={relatedPost.slug} post={relatedPost} compact />
              ))}
            </div>
          </footer>
        )}
      </article>
    </main>
  );
}

function BlogNotFound() {
  return (
    <main className="blog-main">
      <SEO
        title="Note Not Found | Writings"
        description="요청한 글을 찾을 수 없습니다."
        url={`${siteUrl}/blog`}
      />
      <section className="blog-article-shell">
        <h1>글을 못 찾았어.</h1>
        <p className="blog-not-found-copy">
          주소가 바뀌었거나 아직 공개되지 않은 글이야.
        </p>
        <a href="/blog" className="blog-return-link">
          Writings로 돌아가기
        </a>
      </section>
    </main>
  );
}

const blogThemeStorageKey = "blog-theme";

const readStoredBlogTheme = (): BlogTheme => {
  try {
    return localStorage.getItem(blogThemeStorageKey) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
};

export default function BlogPage({ pathname }: BlogPageProps) {
  const [theme, setTheme] = useState<BlogTheme>(readStoredBlogTheme);

  // 앱 셸이 html/body 스크롤을 막고 있어 마운트 전 해시 앵커가 무시된다.
  // 렌더 후 해시 대상을 직접 스크롤로 복원한다.
  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (!hash) return;
    document.getElementById(hash)?.scrollIntoView();
  }, [pathname]);

  const toggleTheme = () => {
    const next: BlogTheme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem(blogThemeStorageKey, next);
    } catch {
      // 저장 실패해도 화면 토글은 유지
    }
  };

  const route = parseBlogRoute(pathname);
  const post = route.view === "post" ? getBlogPost(route.slug) : undefined;

  return (
    <div className="blog-public" data-blog-theme={theme}>
      {route.view === "index" ? (
        <BlogIndex theme={theme} onToggleTheme={toggleTheme} />
      ) : (
        <>
          <BlogCornerNav theme={theme} onToggleTheme={toggleTheme} />
          {route.view === "group" ? (
            <BlogGroupPage groupId={route.groupId} />
          ) : post ? (
            <BlogArticle post={post} />
          ) : (
            <BlogNotFound />
          )}
          <BlogFooter />
        </>
      )}
    </div>
  );
}
