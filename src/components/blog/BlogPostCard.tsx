import BlogMeta from "./BlogMeta";
import type { BlogPost } from "~/content/blog";

interface BlogPostCardProps {
  post: BlogPost;
  selected?: boolean;
  onSelect?: (post: BlogPost) => void;
}

export default function BlogPostCard({
  post,
  selected = false,
  onSelect
}: BlogPostCardProps) {
  const content = (
    <>
      <div className="flex items-start gap-3 min-w-0">
        <span className={`${post.icon} mt-1 text-lg text-red-500`} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-c-900 leading-snug break-words">
            {post.title}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-c-600 line-clamp-2">
            {post.summary}
          </p>
        </div>
      </div>
      <div className="mt-3">
        <BlogMeta post={post} compact />
      </div>
    </>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={() => onSelect(post)}
        className={`w-full border-l-2 px-4 py-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-red-500 ${
          selected
            ? "border-red-500 bg-white dark:bg-gray-900"
            : "border-transparent hover:bg-white dark:hover:bg-gray-900"
        }`}
      >
        {content}
      </button>
    );
  }

  return (
    <a
      href={post.href}
      className="block rounded-md border border-c-300 bg-white px-5 py-5 transition-colors hover:border-red-300 hover:bg-red-50/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 dark:bg-gray-900 dark:hover:bg-gray-900"
    >
      {content}
    </a>
  );
}
