import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeExternalLinks from "rehype-external-links";
import { useStore } from "~/stores";
import BlogMeta from "~/components/blog/BlogMeta";
import MarkdownArticle from "~/components/blog/MarkdownArticle";
import { bear } from "~/configs";
import { blogPosts, getBlogPost } from "~/content/blog";
import AppContainer from "./AppContainer";
import AppNavBar from "./AppNavBar";
import EdgeBackGesture from "../shell/EdgeBackGesture";
import { usePushNavigation } from "../hooks/usePushNavigation";

const NAV_TOP_PT = "calc(var(--mobile-safe-top, 12px) + 36px + 52px)";
const postingCategory = {
  id: "posting",
  title: "Posting",
  icon: "i-fa-solid:pen-nib"
};

function CategoriesView() {
  const push = useStore((s) => s.push);
  const categories = [...bear, postingCategory];

  return (
    <ul className="absolute inset-0 overflow-y-auto" style={{ paddingTop: NAV_TOP_PT }}>
      {categories.map((cat) => (
        <li key={cat.id}>
          <button
            type="button"
            onClick={() =>
              cat.id === "posting"
                ? push({ view: "bear-blog-list" })
                : push({ view: "bear-list", categoryId: cat.id })
            }
            className="w-full px-4 py-4 flex items-center gap-3 border-b border-black/5 dark:border-white/5 active:bg-black/5"
          >
            <span className={`${cat.icon} text-xl text-red-500`} />
            <span className="flex-1 text-left text-black dark:text-white">
              {cat.title}
            </span>
            <span
              className="i-fa-solid:chevron-right text-sm text-c-400"
              aria-hidden="true"
            />
          </button>
        </li>
      ))}
    </ul>
  );
}

function BlogListView() {
  const push = useStore((s) => s.push);

  return (
    <ul className="absolute inset-0 overflow-y-auto" style={{ paddingTop: NAV_TOP_PT }}>
      {blogPosts.map((post) => (
        <li key={post.slug}>
          <button
            type="button"
            onClick={() => push({ view: "bear-blog-article", slug: post.slug })}
            className="w-full px-4 py-3 text-left border-b border-black/5 dark:border-white/5 active:bg-black/5"
          >
            <div className="flex items-start gap-3">
              <span className={`${post.icon} mt-1 text-red-500`} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="text-black dark:text-white font-semibold">
                  {post.title}
                </div>
                <div className="text-c-500 text-sm mt-0.5 line-clamp-2">
                  {post.summary}
                </div>
              </div>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

interface ListViewProps {
  categoryId: string;
}

function ListView({ categoryId }: ListViewProps) {
  const push = useStore((s) => s.push);
  const cat = bear.find((c) => c.id === categoryId);
  if (!cat) return null;
  return (
    <ul className="absolute inset-0 overflow-y-auto" style={{ paddingTop: NAV_TOP_PT }}>
      {cat.md.map((m) => (
        <li key={m.id}>
          <button
            type="button"
            onClick={() =>
              push({
                view: "bear-article",
                categoryId,
                mdId: m.id,
                file: m.file
              })
            }
            className="w-full px-4 py-3 text-left border-b border-black/5 dark:border-white/5 active:bg-black/5"
          >
            <div className="text-black dark:text-white font-semibold">{m.title}</div>
            <div className="text-c-500 text-sm mt-0.5 line-clamp-2">{m.excerpt}</div>
          </button>
        </li>
      ))}
    </ul>
  );
}

interface ArticleViewProps {
  file: string;
}

function ArticleView({ file }: ArticleViewProps) {
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setText("");
    setError(null);
    setLoading(true);
    fetch(file)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((t) => {
        if (!cancelled) {
          setText(t);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(String(e));
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [file]);

  return (
    <div
      className="absolute inset-0 overflow-y-auto px-4 pl-9 pb-8 bear"
      style={{ paddingTop: NAV_TOP_PT }}
    >
      <div className="markdown text-black dark:text-white max-w-none">
        {loading ? (
          <div className="text-c-500 text-sm py-4">불러오는 중…</div>
        ) : error ? (
          <div className="text-red-500">불러오기 실패: {error}</div>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[
              rehypeRaw,
              [rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] }]
            ]}
          >
            {text}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}

function BlogArticleView({ slug }: { slug: string }) {
  const post = getBlogPost(slug);

  if (!post) {
    return (
      <div
        className="absolute inset-0 overflow-y-auto px-4 text-c-500"
        style={{ paddingTop: NAV_TOP_PT }}
      >
        글을 못 찾았어.
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 overflow-y-auto px-4 pl-9 pb-8 bear"
      style={{ paddingTop: NAV_TOP_PT }}
    >
      <article className="pb-8">
        <span className={`${post.icon} text-xl text-red-500`} aria-hidden="true" />
        <h1 className="mt-3 text-2xl font-bold leading-tight text-black dark:text-white">
          {post.title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-c-600">{post.summary}</p>
        <div className="mt-4">
          <BlogMeta post={post} compact />
        </div>
        <MarkdownArticle
          content={post.content}
          className="blog-markdown mt-8 text-black dark:text-white"
        />
      </article>
    </div>
  );
}

export default function BearMobile() {
  const { pushStack, pop } = useStore(
    useShallow((s) => ({
      pushStack: s.pushStack,
      pop: s.pop
    }))
  );
  const dragControls = useDragControls();

  const { direction, handlePop, onExitComplete } = usePushNavigation(
    pushStack.length,
    pop
  );

  const top = pushStack[pushStack.length - 1] ?? null;
  const isBearFrame =
    top?.view === "bear-list" ||
    top?.view === "bear-article" ||
    top?.view === "bear-blog-list" ||
    top?.view === "bear-blog-article";

  let title = "Bear";
  let body: ReactNode = <CategoriesView />;
  let viewKey = "root";
  if (top?.view === "bear-list") {
    const cat = bear.find((c) => c.id === top.categoryId);
    title = cat?.title ?? "List";
    body = <ListView categoryId={top.categoryId} />;
    viewKey = `list-${top.categoryId}`;
  } else if (top?.view === "bear-article") {
    const cat = bear.find((c) => c.id === top.categoryId);
    title = cat?.md.find((m) => m.id === top.mdId)?.title ?? "Article";
    body = <ArticleView file={top.file} />;
    viewKey = `article-${top.mdId}`;
  } else if (top?.view === "bear-blog-list") {
    title = "Posting";
    body = <BlogListView />;
    viewKey = "blog-list";
  } else if (top?.view === "bear-blog-article") {
    const post = getBlogPost(top.slug);
    title = post?.title ?? "Posting";
    body = <BlogArticleView slug={top.slug} />;
    viewKey = `blog-${top.slug}`;
  }

  return (
    <AppContainer dragControls={dragControls}>
      <AppNavBar
        title={title}
        dragControls={dragControls}
        left={
          isBearFrame ? (
            <button
              type="button"
              onClick={handlePop}
              aria-label="뒤로 가기"
              className="flex items-center gap-1 text-blue-500 text-sm"
            >
              <span className="i-fa-solid:chevron-left" aria-hidden="true" />
              <span>Back</span>
            </button>
          ) : null
        }
      />
      {isBearFrame && <EdgeBackGesture onBack={handlePop} />}
      <AnimatePresence mode="wait" custom={direction} onExitComplete={onExitComplete}>
        <motion.div
          key={viewKey}
          custom={direction}
          variants={{
            enter: (d: number) => ({ x: d * 60, opacity: 0 }),
            center: { x: 0, opacity: 1 },
            exit: (d: number) => ({ x: -d * 60, opacity: 0 })
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 350, damping: 32 }}
          className="absolute inset-0"
        >
          {body}
        </motion.div>
      </AnimatePresence>
    </AppContainer>
  );
}
