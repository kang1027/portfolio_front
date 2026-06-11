import BlogMeta from "~/components/blog/BlogMeta";
import BlogPostCard from "~/components/blog/BlogPostCard";
import MarkdownArticle from "~/components/blog/MarkdownArticle";
import SEO from "~/components/SEO";
import {
  blogCategories,
  blogPosts,
  getBlogCategory,
  getBlogPost,
  type BlogPost
} from "~/content/blog";

interface BlogPageProps {
  pathname: string;
}

const siteUrl = "https://www.kang1027.com";

const normalizeSlug = (pathname: string): string | null => {
  const cleaned = pathname.replace(/\/+$/, "");
  if (cleaned === "/blog") return null;
  const match = cleaned.match(/^\/blog\/([^/]+)$/);
  return match?.[1] ?? null;
};

function BlogTopBar() {
  return (
    <header className="blog-topbar">
      <a
        href="/"
        className="inline-flex min-h-11 items-center gap-2 rounded px-2 text-sm font-semibold text-c-800 hover:text-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
      >
        <span className="i-fa-solid:chevron-left text-xs" aria-hidden="true" />
        Portfolio
      </a>
      <a
        href="/blog"
        className="inline-flex min-h-11 items-center gap-2 rounded px-2 text-sm text-c-600 hover:text-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
      >
        <span className="i-fa-solid:book-open" aria-hidden="true" />
        Posting
      </a>
    </header>
  );
}

function BlogLibrary({ selectedPost }: { selectedPost?: BlogPost }) {
  return (
    <aside className="blog-library">
      <div className="px-5 pb-4 pt-5">
        <p className="text-xs font-bold uppercase tracking-wide text-red-500">
          Kang's Notes
        </p>
        <h1 className="mt-2 text-2xl font-bold text-c-900">Posting</h1>
        <p className="mt-2 text-sm leading-relaxed text-c-600">
          프로젝트 결과보다 판단 과정을 남기는 작업 노트.
        </p>
      </div>

      <div className="border-y border-c-300 px-5 py-4">
        <div className="grid gap-2">
          {blogCategories.map((category) => {
            const count = blogPosts.filter(
              (post) => post.category === category.id
            ).length;
            return (
              <a
                key={category.id}
                href={`/blog#${category.id}`}
                className="flex min-h-11 items-center gap-3 rounded-md px-2 text-sm text-c-700 hover:bg-c-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
              >
                <span className={`${category.icon} text-red-500`} aria-hidden="true" />
                <span className="flex-1">{category.title}</span>
                <span className="font-tabular text-xs text-c-500">{count}</span>
              </a>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto py-2">
        {blogPosts.map((post) => (
          <a
            key={post.slug}
            href={post.href}
            className={`block border-l-2 px-5 py-4 transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-red-500 dark:hover:bg-gray-900 ${
              selectedPost?.slug === post.slug
                ? "border-red-500 bg-white dark:bg-gray-900"
                : "border-transparent"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className={`${post.icon} mt-1 text-red-500`} aria-hidden="true" />
              <div className="min-w-0">
                <h2 className="text-sm font-bold leading-snug text-c-900">
                  {post.title}
                </h2>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-c-600">
                  {post.summary}
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </aside>
  );
}

function BlogIndex() {
  const featuredPost = blogPosts[0];

  return (
    <main className="blog-reader">
      <SEO
        title="Posting | kang1027's Portfolio"
        description="kang1027의 프로젝트 판단, 구현 노트, 개인 기록."
        url={`${siteUrl}/blog`}
        keywords="kang1027, portfolio, blog, engineering notes, macOS portfolio"
      />

      <section className="blog-reader-inner">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-wide text-red-500">
            Bear Library
          </p>
          <h2 className="mt-3 text-4xl font-bold leading-tight text-c-900 text-balance">
            결과물 말고, 결과가 나온 판단을 남긴다.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-c-600">
            이 블로그는 별도 매거진이 아니라 포트폴리오 안의 작업 노트다. 프로젝트
            설명에서 빠지는 선택 이유, 구현 제약, 다시 만들 때 줄이고 싶은 것들을
            기록한다.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {featuredPost && (
            <a
              href={featuredPost.href}
              className="rounded-md border border-c-300 bg-white p-6 transition-colors hover:border-red-300 hover:bg-red-50/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500 dark:bg-gray-900 dark:hover:bg-gray-900"
            >
              <span
                className={`${featuredPost.icon} text-2xl text-red-500`}
                aria-hidden="true"
              />
              <h3 className="mt-4 text-2xl font-bold leading-tight text-c-900">
                {featuredPost.title}
              </h3>
              <p className="mt-3 leading-7 text-c-600">{featuredPost.summary}</p>
              <div className="mt-5">
                <BlogMeta post={featuredPost} />
              </div>
            </a>
          )}

          <div className="grid gap-3">
            {blogCategories.map((category) => (
              <section key={category.id} id={category.id} className="scroll-mt-24">
                <div className="mb-3 flex items-center gap-2">
                  <span className={`${category.icon} text-red-500`} aria-hidden="true" />
                  <h3 className="font-bold text-c-900">{category.title}</h3>
                </div>
                <p className="mb-3 text-sm text-c-600">{category.description}</p>
              </section>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-4">
          {blogPosts.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </main>
  );
}

function BlogArticle({ post }: { post: BlogPost }) {
  const category = getBlogCategory(post.category);

  return (
    <main className="blog-reader">
      <SEO
        title={`${post.title} | Posting`}
        description={post.summary}
        url={`${siteUrl}${post.href}`}
        keywords={post.tags.join(", ")}
        type="article"
        publishedTime={post.date}
        tags={post.tags}
      />

      <article className="blog-reader-inner">
        <a
          href="/blog"
          className="mb-8 inline-flex min-h-11 items-center gap-2 rounded text-sm font-semibold text-c-600 hover:text-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
        >
          <span className="i-fa-solid:arrow-left text-xs" aria-hidden="true" />
          All Notes
        </a>

        <div className="max-w-3xl">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span
              className={`${category.icon} inline-flex text-lg text-red-500`}
              aria-hidden="true"
            />
            <span className="text-sm font-bold text-red-500">{category.title}</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight text-c-900 text-balance">
            {post.title}
          </h1>
          <p className="mt-5 text-lg leading-8 text-c-600">{post.summary}</p>
          <div className="mt-6">
            <BlogMeta post={post} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-c-300 px-3 py-1 text-xs text-c-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <MarkdownArticle
          content={post.content}
          className="blog-markdown mt-12 max-w-3xl"
        />
      </article>
    </main>
  );
}

function BlogNotFound() {
  return (
    <main className="blog-reader">
      <SEO
        title="Note Not Found | Posting"
        description="요청한 글을 찾을 수 없습니다."
        url={`${siteUrl}/blog`}
      />
      <section className="blog-reader-inner">
        <h1 className="text-3xl font-bold text-c-900">글을 못 찾았어.</h1>
        <p className="mt-4 text-c-600">주소가 바뀌었거나 아직 공개되지 않은 글이야.</p>
        <a
          href="/blog"
          className="mt-8 inline-flex min-h-11 items-center gap-2 rounded bg-red-500 px-4 text-sm font-bold text-white hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
        >
          Posting으로 돌아가기
        </a>
      </section>
    </main>
  );
}

export default function BlogPage({ pathname }: BlogPageProps) {
  const slug = normalizeSlug(pathname);
  const post = slug ? getBlogPost(slug) : undefined;

  return (
    <div className="blog-public min-h-screen bg-c-100 text-c-900">
      <BlogTopBar />
      <div className="blog-shell">
        <BlogLibrary selectedPost={post} />
        {slug ? post ? <BlogArticle post={post} /> : <BlogNotFound /> : <BlogIndex />}
      </div>
    </div>
  );
}
