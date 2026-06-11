import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeExternalLinks from "rehype-external-links";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula, prism } from "react-syntax-highlighter/dist/esm/styles/prism";
import BlogMeta from "~/components/blog/BlogMeta";
import MarkdownArticle from "~/components/blog/MarkdownArticle";
import bear from "~/configs/bear";
import {
  blogGroups,
  blogPosts,
  getBlogCategory,
  getBlogGroup,
  getBlogPost,
  getBlogPostsByGroup,
  type BlogGroupId,
  type BlogPost
} from "~/content/blog";
import type { BearMdData } from "~/types";

interface ContentProps {
  contentID: string;
  contentURL: string;
}

interface MiddlebarProps {
  items: BearMdData[];
  cur: number;
  setContent: (id: string, url: string, index: number) => void;
}

interface SidebarProps {
  cur: number;
  setMidBar: (index: number) => void;
}

interface BearState extends ContentProps {
  curSidebar: number;
  curMidbar: number;
  midbarList: BearMdData[];
  mode: "markdown" | "blog";
  selectedGroupId: BlogGroupId;
  selectedPostSlug: string;
}

interface MarkdownLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  node?: unknown;
}

const MarkdownLink = ({ node, href, ...props }: MarkdownLinkProps) => {
  return (
    <a
      {...props}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
    />
  );
};

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

const postingSidebarItem = {
  id: "posting",
  title: "Posting",
  icon: "i-fa-solid:pen-nib"
};

const sidebarItems = [...bear, postingSidebarItem];
const postingSidebarIndex = sidebarItems.length - 1;
const defaultBlogGroupId: BlogGroupId = "portfolio";

const Sidebar = ({ cur, setMidBar }: SidebarProps) => {
  return (
    <div text-white>
      <div className="h-12 pr-3 hstack space-x-3 justify-end">
        <span className="i-ic:baseline-cloud-off text-xl" />
        <span className="i-akar-icons:settings-vertical text-xl" />
      </div>
      <ul>
        {sidebarItems.map((item, index) => (
          <li
            key={`bear-sidebar-${item.id}`}
            className={`pl-6 h-8 hstack cursor-default ${
              cur === index ? "bg-red-500" : "bg-transparent"
            } ${cur === index ? "" : "hover:bg-gray-600"}`}
            onClick={() => setMidBar(index)}
          >
            <span className={item.icon} />
            <span className="ml-2">{item.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

interface BlogMiddlebarProps {
  selectedGroupId: BlogGroupId;
  selectedSlug: string;
  onSelectGroup: (groupId: BlogGroupId) => void;
  onSelectPost: (post: BlogPost) => void;
}

const BlogMiddlebar = ({
  selectedGroupId,
  selectedSlug,
  onSelectGroup,
  onSelectPost
}: BlogMiddlebarProps) => {
  return (
    <div className="h-full overflow-y-auto">
      <div className="border-b border-c-300 px-4 py-4">
        <p className="text-xs font-bold uppercase tracking-wide text-red-500">
          Kang's Writings
        </p>
        <h2 className="mt-1 text-lg font-bold text-c-900">Posting</h2>
        <p className="mt-1 text-xs leading-relaxed text-c-600">
          프로젝트 흐름별 작업 판단 기록
        </p>
      </div>
      <div className="py-2">
        {blogGroups.map((group) => {
          const posts = getBlogPostsByGroup(group.id);
          const selected = selectedGroupId === group.id;

          return (
            <section key={group.id} className="border-b border-c-200">
              <button
                type="button"
                className={`w-full px-4 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-red-500 ${
                  selected
                    ? "bg-white dark:bg-neutral-900"
                    : "hover:bg-white dark:hover:bg-neutral-900"
                }`}
                onClick={() => onSelectGroup(group.id)}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-bold text-c-900">{group.title}</span>
                  <span className="font-tabular text-xs text-c-500">{posts.length}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-c-600">
                  {group.description}
                </p>
              </button>

              <div
                className={`grid transition-[grid-template-rows] duration-200 ${
                  selected ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  {posts.map((post) => (
                    <button
                      key={post.slug}
                      type="button"
                      className={`w-full border-l-2 px-6 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-red-500 ${
                        selectedSlug === post.slug
                          ? "border-red-500 bg-red-50/60 dark:bg-red-950/20"
                          : "border-transparent hover:bg-white dark:hover:bg-neutral-900"
                      }`}
                      onClick={() => onSelectPost(post)}
                    >
                      <h3 className="text-sm font-semibold leading-snug text-c-900">
                        {post.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-c-600">
                        {post.summary}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

const BlogContent = ({ post }: { post: BlogPost | undefined }) => {
  if (!post) {
    return (
      <div className="flex h-full items-center justify-center text-c-500">
        아직 공개된 글이 없어.
      </div>
    );
  }

  const category = getBlogCategory(post.category);
  const group = getBlogGroup(post.group);

  return (
    <article className="h-full overflow-y-auto px-10 py-8 text-c-700 xl:px-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="min-w-0 text-sm font-bold text-red-500">
            <span>Posting / {group.title}</span>
            <span className="text-c-500"> / {category.title}</span>
          </div>
          <a
            href={post.href}
            className="inline-flex min-h-9 items-center rounded px-2 text-sm text-c-500 hover:text-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
          >
            외부에서 열기
          </a>
        </div>

        <h1 className="text-4xl font-bold leading-tight text-c-900 text-balance">
          {post.title}
        </h1>
        <p className="mt-4 text-lg leading-8 text-c-600">{post.summary}</p>
        <div className="mt-5">
          <BlogMeta post={post} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag} className="border-b border-c-300 pb-0.5 text-xs text-c-600">
              #{tag}
            </span>
          ))}
        </div>

        <MarkdownArticle content={post.content} className="blog-markdown mt-10" />
      </div>
    </article>
  );
};

const Middlebar = ({ items, cur, setContent }: MiddlebarProps) => {
  const stopOpeningArticle = (event: React.MouseEvent<HTMLAnchorElement>): void => {
    event.stopPropagation();
  };

  return (
    <ul>
      {items.map((item: BearMdData, index: number) => (
        <li
          key={`bear-midbar-${item.id}`}
          className={`h-24 flex flex-col cursor-default border-l-2 ${
            cur === index
              ? "border-red-500 bg-white dark:bg-gray-900"
              : "border-transparent bg-transparent"
          } hover:(bg-white dark:bg-gray-900)`}
          onClick={() => setContent(item.id, item.file, index)}
        >
          <div className="h-8 mt-3 hstack">
            <div className="-mt-1 w-10 vstack text-c-500">
              <span className={item.icon} />
            </div>
            <span className="relative flex-1 font-bold" text="gray-900 dark:gray-100">
              {item.title}
              {item.link && (
                <a
                  pos="absolute top-1 right-4"
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={stopOpeningArticle}
                >
                  <span className="i-ant-design:link-outlined text-c-500" />
                </a>
              )}
            </span>
          </div>
          <div className="flex-1 ml-10" p="b-2 r-1" text="sm c-500" border="b c-300">
            {item.excerpt}
          </div>
        </li>
      ))}
    </ul>
  );
};

const fixImageURL = (text: string): string => {
  text = text.replace(/&nbsp;/g, "");
  return text;
};

const Content = ({ contentID, contentURL }: ContentProps) => {
  const [storeMd, setStoreMd] = useState<{ [key: string]: string }>({});
  const dark = useStore((state) => state.dark);

  const fetchMarkdown = useCallback(
    (id: string, url: string) => {
      if (!storeMd[id]) {
        fetch(url)
          .then((response) => response.text())
          .then((text) => {
            storeMd[id] = fixImageURL(text);
            setStoreMd({ ...storeMd });
          })
          .catch((error) => console.error(error));
      }
    },
    [storeMd]
  );

  useEffect(() => {
    fetchMarkdown(contentID, contentURL);
  }, [contentID, contentURL, fetchMarkdown]);

  return (
    <div className="markdown w-2/3 mx-auto px-2 py-6 text-c-700">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeRaw,
          rehypeKatex,
          [rehypeExternalLinks, { target: "_blank", rel: "noopener noreferrer" }]
        ]}
        components={{
          ...Highlighter(dark as boolean),
          // Allow HTML img tags to render properly
          img: ({ node, ...props }) => (
            <img
              {...props}
              className="max-w-full h-auto"
              loading="lazy"
              onError={(e) => {
                // eslint-disable-next-line react/prop-types
                console.error("Image failed to load:", props.src);
                e.currentTarget.style.display = "none";
              }}
            />
          ),
          a: MarkdownLink
        }}
      >
        {storeMd[contentID]}
      </ReactMarkdown>
    </div>
  );
};

const Bear = () => {
  const [state, setState] = useState<BearState>({
    curSidebar: 0,
    curMidbar: 0,
    midbarList: bear[0].md,
    contentID: bear[0].md[0].id,
    contentURL: bear[0].md[0].file,
    mode: "markdown",
    selectedGroupId: defaultBlogGroupId,
    selectedPostSlug: blogPosts[0]?.slug ?? ""
  });

  const setMidBar = (index: number) => {
    if (index === postingSidebarIndex) {
      const posts = getBlogPostsByGroup(state.selectedGroupId);
      setState({
        curSidebar: index,
        curMidbar: 0,
        midbarList: [],
        contentID: "",
        contentURL: "",
        mode: "blog",
        selectedGroupId: state.selectedGroupId,
        selectedPostSlug: posts[0]?.slug ?? blogPosts[0]?.slug ?? ""
      });
      return;
    }

    const items = bear[index].md;
    setState({
      curSidebar: index,
      curMidbar: 0,
      midbarList: items,
      contentID: items[0].id,
      contentURL: items[0].file,
      mode: "markdown",
      selectedGroupId: state.selectedGroupId,
      selectedPostSlug: state.selectedPostSlug
    });
  };

  const setContent = (id: string, url: string, index: number) => {
    setState({
      ...state,
      curMidbar: index,
      contentID: id,
      contentURL: url,
      mode: "markdown",
      selectedGroupId: state.selectedGroupId
    });
  };

  const setBlogGroup = (groupId: BlogGroupId) => {
    const posts = getBlogPostsByGroup(groupId);
    setState({
      ...state,
      curMidbar: 0,
      mode: "blog",
      selectedGroupId: groupId,
      selectedPostSlug: posts[0]?.slug ?? ""
    });
  };

  const setBlogPost = (post: BlogPost) => {
    setState({
      ...state,
      curMidbar: 0,
      mode: "blog",
      selectedGroupId: post.group,
      selectedPostSlug: post.slug
    });
  };

  const selectedPost =
    getBlogPost(state.selectedPostSlug) ??
    getBlogPostsByGroup(state.selectedGroupId)[0] ??
    blogPosts[0];

  return (
    <div className="bear font-avenir flex h-full">
      <div className="w-44 overflow-auto bg-gray-700">
        <Sidebar cur={state.curSidebar} setMidBar={setMidBar} />
      </div>
      <div className="w-60 overflow-auto" bg="gray-50 dark:gray-800" border="r c-300">
        {state.mode === "blog" ? (
          <BlogMiddlebar
            selectedGroupId={state.selectedGroupId}
            selectedSlug={selectedPost?.slug ?? ""}
            onSelectGroup={setBlogGroup}
            onSelectPost={setBlogPost}
          />
        ) : (
          <Middlebar
            items={state.midbarList}
            cur={state.curMidbar}
            setContent={setContent}
          />
        )}
      </div>
      <div className="flex-1 overflow-auto" bg="gray-50 dark:gray-800">
        {state.mode === "blog" ? (
          <BlogContent post={selectedPost} />
        ) : (
          <Content contentID={state.contentID} contentURL={state.contentURL} />
        )}
      </div>
    </div>
  );
};

export default Bear;
