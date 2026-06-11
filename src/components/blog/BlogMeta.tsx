import { getBlogCategory, type BlogPost } from "~/content/blog";

interface BlogMetaProps {
  post: BlogPost;
  compact?: boolean;
}

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric"
});

export default function BlogMeta({ post, compact = false }: BlogMetaProps) {
  const category = getBlogCategory(post.category);

  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-c-500 ${
        compact ? "text-xs" : "text-sm"
      }`}
    >
      <span className="inline-flex items-center gap-1.5">
        <span className={category.icon} aria-hidden="true" />
        {category.title}
      </span>
      <span className="font-tabular">{dateFormatter.format(new Date(post.date))}</span>
      <span>{post.readingMinutes}분 읽기</span>
      {post.project && (
        <span className="inline-flex items-center gap-1.5">
          <span className="i-fa-solid:folder-open" aria-hidden="true" />
          {post.project}
        </span>
      )}
    </div>
  );
}
