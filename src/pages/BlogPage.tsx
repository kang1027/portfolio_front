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

const normalizeSlug = (pathname: string): string | null => {
  const cleaned = pathname.replace(/\/+$/, "");
  if (cleaned === "/blog") return null;
  const match = cleaned.match(/^\/blog\/([^/]+)$/);
  return match?.[1] ?? null;
};

type BlogSidebarView = "threads" | "dates";

function BlogThemeToggle() {
  const dark = useStore((state) => state.dark);
  const toggleDark = useStore((state) => state.toggleDark);

  return (
    <button
      type="button"
      className="blog-theme-toggle"
      aria-pressed={dark}
      onClick={toggleDark}
    >
      {dark ? "Light" : "Dark"}
    </button>
  );
}

function BlogTopBar() {
  return (
    <header className="blog-site-header">
      <a href="/" className="blog-brand">
        Kang Donghyun
      </a>
      <nav className="blog-site-nav" aria-label="Blog navigation">
        <a href="/blog">갈래</a>
        <a href="/blog#archive">날짜</a>
        <BlogThemeToggle />
      </nav>
    </header>
  );
}

function BlogPostRow({ post, compact = false }: { post: BlogPost; compact?: boolean }) {
  const group = getBlogGroup(post.group);
  const contextLabel = post.project ?? group.title;

  return (
    <a href={post.href} className={compact ? "blog-archive-row" : "blog-post-row"}>
      <time dateTime={post.date} className="blog-post-date">
        {compact ? shortDateFormatter.format(new Date(post.date)) : post.date}
      </time>
      <span className="blog-post-copy">
        <span className="blog-post-title">{post.title}</span>
        {!compact && <span className="blog-post-summary">{post.summary}</span>}
        {compact && post.tags.length > 0 && (
          <span className="blog-post-tags" aria-label="Tags">
            {post.tags.slice(0, 4).map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </span>
        )}
      </span>
      {!compact && <span className="blog-post-group">{contextLabel}</span>}
    </a>
  );
}

function BlogThreadNav() {
  return (
    <nav className="blog-thread-nav" aria-label="Writing threads">
      <p>갈래</p>
      {blogGroups.map((group) => {
        const posts = getBlogPostsByGroup(group.id);
        const count = posts.length;
        if (count === 0) {
          return (
            <span key={group.id} className="blog-thread-nav-empty" aria-disabled="true">
              <span>{group.title}</span>
              <small>{count}</small>
            </span>
          );
        }

        const firstPost = posts[0];
        return (
          <a key={group.id} href={firstPost.href}>
            <span>{group.title}</span>
            <small>{count}</small>
          </a>
        );
      })}
      <a href="#archive">
        <span>Archive</span>
        <small>{blogPosts.length}</small>
      </a>
    </nav>
  );
}

function BlogYearNav() {
  return (
    <nav className="blog-thread-nav" aria-label="Writing archive">
      <p>날짜</p>
      {blogPostsByYear.map((yearGroup) => (
        <a key={yearGroup.year} href={`#year-${yearGroup.year}`}>
          <span>{yearGroup.year}</span>
          <small>{yearGroup.posts.length}</small>
        </a>
      ))}
      <a href="#archive">
        <span>전체</span>
        <small>{blogPosts.length}</small>
      </a>
    </nav>
  );
}

function BlogIndexRail() {
  const [sidebarView, setSidebarView] = useState<BlogSidebarView>("threads");

  return (
    <aside className="blog-index-rail">
      <div className="blog-sidebar-panel">
        <a href="/" className="blog-sidebar-brand">
          Kang Donghyun
        </a>
        <nav className="blog-sidebar-links" aria-label="Blog navigation">
          <button
            type="button"
            aria-pressed={sidebarView === "threads"}
            onClick={() => setSidebarView("threads")}
          >
            갈래
          </button>
          <button
            type="button"
            aria-pressed={sidebarView === "dates"}
            onClick={() => setSidebarView("dates")}
          >
            날짜
          </button>
          <BlogThemeToggle />
        </nav>
        {sidebarView === "threads" ? <BlogThreadNav /> : <BlogYearNav />}
      </div>

      <section className="blog-principle-panel" aria-label="견현사제">
        <p className="blog-kicker">견현사제</p>
        <h1>見賢思齊</h1>
        <p className="blog-hero-copy">
          "어진 사람을 보면 어떻게 그와 같아질까를 생각하며, 어질지 못한 사람을 보면
          속으로 스스로 반성해야 한다."
        </p>
      </section>
    </aside>
  );
}

function BlogIndex() {
  return (
    <main className="blog-index-shell">
      <SEO
        title="Writings | kang1027's Portfolio"
        description="견현사제의 태도로 남기는 강동현의 프로젝트 판단, 구현 노트, 개인 기록."
        url={`${siteUrl}/blog`}
        keywords="kang1027, portfolio, blog, engineering notes, writing"
      />

      <BlogIndexRail />

      <section className="blog-content-panel" aria-label="Blog posts">
        <div className="blog-flow">
          <section id="archive" className="blog-section blog-archive">
            <header className="blog-section-header">
              <p>Archive</p>
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
        </div>
      </section>
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

export default function BlogPage({ pathname }: BlogPageProps) {
  useLayoutEffect(() => {
    const store = useStore.getState();
    if (store.dark) return;

    useStore.setState({ dark: true });
    document.documentElement.classList.add("dark");
  }, []);

  const slug = normalizeSlug(pathname);
  const post = slug ? getBlogPost(slug) : undefined;
  const className = slug ? "blog-public" : "blog-public blog-public-index";

  return (
    <div className={className}>
      {slug && <BlogTopBar />}
      {slug ? post ? <BlogArticle post={post} /> : <BlogNotFound /> : <BlogIndex />}
    </div>
  );
}
