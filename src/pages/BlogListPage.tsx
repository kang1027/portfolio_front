import { Link } from "react-router-dom";
import { format } from "date-fns";
import BlogHeader from "./BlogHeader";
import SEO from "~/components/SEO";
import postingCategories, { getAllPosts } from "~/configs/posting";
import type { PostingMdData } from "~/types";

export default function BlogListPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const posts = selectedCategory === "all"
    ? getAllPosts()
    : postingCategories.find(cat => cat.id === selectedCategory)?.posts || [];

  return (
    <div className="min-h-screen bg-c-50">
      <SEO
        title="Blog | kang1027's Portfolio"
        description="개발과 일상에 대한 이야기를 공유하는 블로그입니다."
        keywords="blog, tech, programming, life, development"
        url="https://www.kang1027.com/blog"
      />
      <BlogHeader />

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-c-900 mb-2">Blog</h1>
          <p className="text-lg text-c-600">개발과 일상에 대한 이야기</p>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === "all"
                ? "bg-red-500 text-white"
                : "bg-c-200 text-c-700 hover:bg-c-300"
            }`}
          >
            All
          </button>
          {postingCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors hstack gap-2 ${
                selectedCategory === category.id
                  ? "bg-red-500 text-white"
                  : "bg-c-200 text-c-700 hover:bg-c-300"
              }`}
            >
              <span className={category.icon} />
              {category.title}
            </button>
          ))}
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-c-500 text-lg">포스트가 없습니다.</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

interface PostCardProps {
  post: PostingMdData;
}

function PostCard({ post }: PostCardProps) {
  const category = postingCategories.find(cat => cat.id === post.category);

  return (
    <Link
      to={`/blog/${post.category}/${post.slug}`}
      className="block group"
    >
      <article className="p-6 rounded-lg border border-c-300 bg-white dark:bg-gray-900 hover:shadow-md transition-all duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3 flex-1">
            <span className={`${post.icon} text-2xl text-red-500`} />
            <h2 className="text-xl font-bold text-c-900 group-hover:text-red-500 transition-colors">
              {post.title}
            </h2>
          </div>
        </div>

        {/* Excerpt */}
        <p className="text-c-600 mb-4 line-clamp-2">
          {post.excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center gap-4 text-sm text-c-500">
          {category && (
            <span className="hstack gap-1">
              <span className={category.icon} />
              {category.title}
            </span>
          )}
          {post.frontmatter?.date && (
            <span className="hstack gap-1">
              <span className="i-fa-solid:calendar" />
              {format(new Date(post.frontmatter.date), "yyyy.MM.dd")}
            </span>
          )}
          {post.frontmatter?.tags && post.frontmatter.tags.length > 0 && (
            <div className="flex gap-2">
              {post.frontmatter.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 rounded bg-c-200 text-c-700 text-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
