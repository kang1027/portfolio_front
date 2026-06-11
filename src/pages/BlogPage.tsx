import BlogMeta from "~/components/blog/BlogMeta";
import MarkdownArticle from "~/components/blog/MarkdownArticle";
import SEO from "~/components/SEO";
import {
  blogGroups,
  blogPosts,
  blogPostsByYear,
  getBlogCategory,
  getBlogGroup,
  getBlogPost,
  getBlogPostsByGroup,
  type BlogGroup,
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
        <a href="/blog#threads">Threads</a>
        <a href="/blog#archive">Archive</a>
        <BlogThemeToggle />
      </nav>
    </header>
  );
}

function BlogPostRow({ post, compact = false }: { post: BlogPost; compact?: boolean }) {
  const group = getBlogGroup(post.group);

  return (
    <a href={post.href} className={compact ? "blog-archive-row" : "blog-post-row"}>
      <time dateTime={post.date} className="blog-post-date">
        {compact ? shortDateFormatter.format(new Date(post.date)) : post.date}
      </time>
      <span className="blog-post-copy">
        <span className="blog-post-title">{post.title}</span>
        {!compact && <span className="blog-post-summary">{post.summary}</span>}
      </span>
      {!compact && <span className="blog-post-group">{group.title}</span>}
    </a>
  );
}

function BlogGroupBlock({ group }: { group: BlogGroup }) {
  const posts = getBlogPostsByGroup(group.id);
  const groupTitle = group.href ? (
    <a
      href={group.href}
      target={group.href.startsWith("http") ? "_blank" : undefined}
      rel={group.href.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {group.title}
    </a>
  ) : (
    group.title
  );

  return (
    <section id={`thread-${group.id}`} className="blog-thread-block">
      <header>
        <p className="blog-thread-label">Thread</p>
        <h3>{groupTitle}</h3>
        <p>{group.description}</p>
      </header>
      <div className="blog-thread-posts">
        {posts.map((post) => (
          <BlogPostRow key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}

function BlogIndex() {
  return (
    <main className="blog-main">
      <SEO
        title="Writings | kang1027's Portfolio"
        description="견현사제의 태도로 남기는 강동현의 프로젝트 판단, 구현 노트, 개인 기록."
        url={`${siteUrl}/blog`}
        keywords="kang1027, portfolio, blog, engineering notes, writing"
      />

      <section className="blog-hero">
        <p className="blog-kicker">Kang's Writings</p>
        <h1>견현사제(見賢思齊)</h1>
        <p>
          좋은 사람을 보면 그 사람처럼 되기를 생각한다는 뜻처럼, 잘 만든 것 앞에서 기준을
          낮추지 않으려 한다. 프로젝트를 만들며 본 좋은 판단, 따라가고 싶은 기준, 아직 못
          닿은 부분을 기록한다.
        </p>
      </section>

      <div className="blog-home-layout">
        <aside className="blog-thread-nav" aria-label="Writing threads">
          <p>Threads</p>
          {blogGroups.map((group) => {
            const count = getBlogPostsByGroup(group.id).length;
            return (
              <a key={group.id} href={`#thread-${group.id}`}>
                <span>{group.title}</span>
                <small>{count}</small>
              </a>
            );
          })}
          <a href="#archive">
            <span>Archive</span>
            <small>{blogPosts.length}</small>
          </a>
        </aside>

        <div className="blog-flow">
          <section id="threads" className="blog-section">
            <header className="blog-section-header">
              <p>Project Threads</p>
              <h2>프로젝트별로 이어서 읽기</h2>
            </header>
            <div className="blog-thread-list">
              {blogGroups.map((group) => (
                <BlogGroupBlock key={group.id} group={group} />
              ))}
            </div>
          </section>

          <section id="archive" className="blog-section blog-archive">
            <header className="blog-section-header">
              <p>Archive</p>
              <h2>날짜순으로 훑기</h2>
            </header>
            {blogPostsByYear.map((yearGroup) => (
              <section key={yearGroup.year} className="blog-year-block">
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
      </div>
    </main>
  );
}

function BlogArticle({ post }: { post: BlogPost }) {
  const category = getBlogCategory(post.category);
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
          <p className="blog-kicker">{category.title}</p>
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

  return (
    <div className="blog-public">
      <BlogTopBar />
      {slug ? post ? <BlogArticle post={post} /> : <BlogNotFound /> : <BlogIndex />}
    </div>
  );
}
