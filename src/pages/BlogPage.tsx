import BlogMeta from "~/components/blog/BlogMeta";
import MarkdownArticle from "~/components/blog/MarkdownArticle";
import SEO from "~/components/SEO";
import {
  blogGroups,
  blogPosts,
  blogPostsByYear,
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

const normalizeSlug = (pathname: string): string | null => {
  const cleaned = pathname.replace(/\/+$/, "");
  if (cleaned === "/blog") return null;
  const match = cleaned.match(/^\/blog\/([^/]+)$/);
  return match?.[1] ?? null;
};

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

function BlogTopBar({ theme, onToggleTheme }: BlogThemeProps) {
  return (
    <header className="blog-site-header">
      <a href="/" className="blog-brand">
        강동현
      </a>
      <nav className="blog-site-nav" aria-label="Blog navigation">
        <a href="/blog#threads">갈래</a>
        <a href="/blog#archive">날짜</a>
        <BlogThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
      </nav>
    </header>
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
      <span className="blog-post-copy">
        <span className="blog-post-title">{post.title}</span>
        {!compact && <span className="blog-post-summary">{post.summary}</span>}
      </span>
      {!compact && post.project && (
        <span className="blog-post-group">{post.project}</span>
      )}
    </a>
  );
}

function BlogHero() {
  return (
    <section className="blog-hero" aria-label="견현사제">
      <div className="blog-hero-head">
        <h1>見賢思齊</h1>
        <span className="blog-seal" aria-hidden="true">
          <span>見</span>
          <span>賢</span>
          <span>思</span>
          <span>齊</span>
        </span>
      </div>
      <figure className="blog-hero-quote">
        <blockquote className="blog-hero-copy">
          “어진 사람을 보면 어떻게 그와 같아질까를 생각하며, 어질지 못한 사람을 보면
          속으로 스스로 반성해야 한다.”
        </blockquote>
        <figcaption>— 논어(論語) · 이인편</figcaption>
      </figure>
    </section>
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
    <section id="threads" className="blog-section" aria-label="갈래별 글">
      <header className="blog-section-header">
        <h2>갈래로 모아 읽기</h2>
      </header>
      <div className="blog-thread-list">
        {blogGroups.map((group) => {
          const posts = getBlogPostsByGroup(group.id);
          if (posts.length === 0) return null;

          return (
            <section
              key={group.id}
              id={`thread-${group.id}`}
              className="blog-thread-block"
            >
              <header>
                <h3>{group.title}</h3>
                <p>{group.description}</p>
              </header>
              <div className="blog-thread-posts">
                {posts.map((post) => (
                  <BlogPostRow key={post.slug} post={post} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}

function BlogArchiveSection() {
  return (
    <section id="archive" className="blog-section blog-archive" aria-label="날짜순 글">
      <header className="blog-section-header">
        <h2>날짜순으로 훑기</h2>
      </header>
      {blogPostsByYear.map((yearGroup) => (
        <section
          key={yearGroup.year}
          id={`year-${yearGroup.year}`}
          className="blog-year-block"
        >
          <h3>{yearGroup.year}</h3>
          <div>
            {yearGroup.posts.map((post) => (
              <BlogPostRow key={post.slug} post={post} compact />
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}

function BlogIndex() {
  return (
    <main className="blog-index-main">
      <SEO
        title="Writings | kang1027's Portfolio"
        description="견현사제의 태도로 남기는 강동현의 프로젝트 판단, 구현 노트, 개인 기록."
        url={`${siteUrl}/blog`}
        keywords="kang1027, portfolio, blog, engineering notes, writing"
      />

      <BlogHero />
      <BlogThreadSections />
      <BlogArchiveSection />
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
          <a href={`/blog#thread-${group.id}`}>{group.title}</a>
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

  const slug = normalizeSlug(pathname);
  const post = slug ? getBlogPost(slug) : undefined;

  return (
    <div className="blog-public" data-blog-theme={theme}>
      <BlogTopBar theme={theme} onToggleTheme={toggleTheme} />
      {slug ? post ? <BlogArticle post={post} /> : <BlogNotFound /> : <BlogIndex />}
      <BlogFooter />
    </div>
  );
}
