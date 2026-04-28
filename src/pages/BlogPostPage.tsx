import { useParams, Link, Navigate } from "react-router-dom";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeExternalLinks from "rehype-external-links";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula, prism } from "react-syntax-highlighter/dist/esm/styles/prism";
import BlogHeader from "./BlogHeader";
import SEO from "~/components/SEO";
import { getPostBySlug } from "~/configs/posting";
import { fetchMarkdown } from "~/utils/markdown";
import type { ParsedMarkdown } from "~/utils/markdown";

const Highlighter = (dark: boolean): any => {
  interface codeProps {
    node: any;
    inline: boolean;
    className: string;
    children: any;
  }

  return {
    code({ node, inline, className, children, ...props }: codeProps) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <SyntaxHighlighter
          style={dark ? dracula : prism}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code className={className}>{children}</code>
      );
    }
  };
};

export default function BlogPostPage() {
  const { category, slug } = useParams<{ category: string; slug: string }>();
  const [markdown, setMarkdown] = useState<ParsedMarkdown | null>(null);
  const [loading, setLoading] = useState(true);

  const dark = useStore((state) => state.dark);

  const post = category && slug ? getPostBySlug(category, slug) : null;

  useEffect(() => {
    if (post) {
      setLoading(true);
      fetchMarkdown(post.file)
        .then((result) => {
          setMarkdown(result);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error loading markdown:", error);
          setLoading(false);
        });
    }
  }, [post]);

  // Post not found
  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const fullUrl = `https://www.kang1027.com/blog/${category}/${slug}`;
  const seoTitle = markdown?.frontmatter?.title || post.title;
  const seoDescription = markdown?.frontmatter?.description || post.excerpt;
  const seoKeywords = markdown?.frontmatter?.tags?.join(", ") || post.title;

  return (
    <div className="min-h-screen bg-c-50">
      <SEO
        title={`${seoTitle} | kang1027's Blog`}
        description={seoDescription}
        keywords={seoKeywords}
        url={fullUrl}
        type="article"
        blogPost={
          markdown?.frontmatter
            ? {
                title: markdown.frontmatter.title,
                description: markdown.frontmatter.description,
                date: markdown.frontmatter.date,
                author: markdown.frontmatter.author,
                url: fullUrl,
                image: markdown.frontmatter.image,
                tags: markdown.frontmatter.tags
              }
            : undefined
        }
      />
      <BlogHeader />

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Back to Blog */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-c-600 hover:text-red-500 transition-colors mb-6"
        >
          <span className="i-fa-solid:arrow-left" />
          Back to Blog
        </Link>

        {/* Post Header */}
        <article className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className={`${post.icon} text-2xl text-red-500`} />
            <span className="text-red-500 font-medium">{category}</span>
          </div>

          <h1 className="text-4xl font-bold text-c-900 mb-4">
            {markdown?.frontmatter?.title || post.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-c-500 mb-6">
            {markdown?.frontmatter?.date && (
              <span className="hstack gap-1">
                <span className="i-fa-solid:calendar" />
                {format(new Date(markdown.frontmatter.date), "yyyy년 MM월 dd일")}
              </span>
            )}
            {markdown?.frontmatter?.author && (
              <span className="hstack gap-1">
                <span className="i-fa-solid:user" />
                {markdown.frontmatter.author}
              </span>
            )}
            {markdown?.frontmatter?.tags && markdown.frontmatter.tags.length > 0 && (
              <div className="flex gap-2">
                {markdown.frontmatter.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded bg-c-200 text-c-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          {markdown?.frontmatter?.description && (
            <p className="text-lg text-c-600 border-l-4 border-red-500 pl-4">
              {markdown.frontmatter.description}
            </p>
          )}
        </article>

        {/* Post Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-c-500">Loading...</div>
          </div>
        ) : (
          <div className="prose prose-lg max-w-none">
            <div className="markdown bg-white dark:bg-gray-900 rounded-lg p-8 border border-c-300">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[
                  rehypeRaw,
                  rehypeKatex,
                  [rehypeExternalLinks, { target: "_blank", rel: "noopener noreferrer" }]
                ]}
                components={{
                  ...Highlighter(dark as boolean),
                  img: ({ node, ...props }) => (
                    <img
                      {...props}
                      className="max-w-full h-auto rounded-lg"
                      loading="lazy"
                      onError={(e) => {
                        console.error("Image failed to load:", props.src);
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ),
                  a: ({ node, ...props }) => (
                    <a
                      {...props}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    />
                  )
                }}
              >
                {markdown?.content || ""}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Back to Blog (Bottom) */}
        <div className="mt-12 pt-8 border-t border-c-300">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-c-600 hover:text-red-500 transition-colors"
          >
            <span className="i-fa-solid:arrow-left" />
            Back to Blog
          </Link>
        </div>
      </main>
    </div>
  );
}
