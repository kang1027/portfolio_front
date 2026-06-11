import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeExternalLinks from "rehype-external-links";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula, prism } from "react-syntax-highlighter/dist/esm/styles/prism";
import BlogMeta from "~/components/blog/BlogMeta";
import BlogPostCard from "~/components/blog/BlogPostCard";
import MarkdownArticle from "~/components/blog/MarkdownArticle";
import bear from "~/configs/bear";
import { blogPosts, getBlogCategory, getBlogPost, type BlogPost } from "~/content/blog";
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
  selectedSlug: string;
  onSelect: (post: BlogPost, index: number) => void;
}

const BlogMiddlebar = ({ selectedSlug, onSelect }: BlogMiddlebarProps) => {
  return (
    <div className="h-full overflow-y-auto">
      <div className="border-b border-c-300 px-4 py-4">
        <p className="text-xs font-bold uppercase tracking-wide text-red-500">
          Kang's Notes
        </p>
        <h2 className="mt-1 text-lg font-bold text-c-900">Posting</h2>
        <p className="mt-1 text-xs leading-relaxed text-c-600">작업 판단과 구현 기록</p>
      </div>
      <div>
        {blogPosts.map((post, index) => (
          <BlogPostCard
            key={post.slug}
            post={post}
            selected={post.slug === selectedSlug}
            onSelect={() => onSelect(post, index)}
          />
        ))}
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

  return (
    <article className="h-full overflow-y-auto px-10 py-8 text-c-700 xl:px-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2 text-sm font-bold text-red-500">
            <span className={category.icon} aria-hidden="true" />
            <span>{category.title}</span>
          </div>
          <a
            href={post.href}
            className="inline-flex min-h-9 items-center gap-2 rounded px-2 text-sm text-c-500 hover:text-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
          >
            <span className="i-ant-design:link-outlined" aria-hidden="true" />
            Permalink
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
            <span
              key={tag}
              className="rounded-full border border-c-300 px-3 py-1 text-xs text-c-600"
            >
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
    selectedPostSlug: blogPosts[0]?.slug ?? ""
  });

  const setMidBar = (index: number) => {
    if (index === postingSidebarIndex) {
      setState({
        curSidebar: index,
        curMidbar: 0,
        midbarList: [],
        contentID: "",
        contentURL: "",
        mode: "blog",
        selectedPostSlug: blogPosts[0]?.slug ?? ""
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
      selectedPostSlug: state.selectedPostSlug
    });
  };

  const setContent = (id: string, url: string, index: number) => {
    setState({
      ...state,
      curMidbar: index,
      contentID: id,
      contentURL: url,
      mode: "markdown"
    });
  };

  const setBlogPost = (post: BlogPost, index: number) => {
    setState({
      ...state,
      curMidbar: index,
      mode: "blog",
      selectedPostSlug: post.slug
    });
  };

  const selectedPost = getBlogPost(state.selectedPostSlug) ?? blogPosts[0];

  return (
    <div className="bear font-avenir flex h-full">
      <div className="w-44 overflow-auto bg-gray-700">
        <Sidebar cur={state.curSidebar} setMidBar={setMidBar} />
      </div>
      <div className="w-60 overflow-auto" bg="gray-50 dark:gray-800" border="r c-300">
        {state.mode === "blog" ? (
          <BlogMiddlebar selectedSlug={state.selectedPostSlug} onSelect={setBlogPost} />
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
