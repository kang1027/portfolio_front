import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeExternalLinks from "rehype-external-links";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula, prism } from "react-syntax-highlighter/dist/esm/styles/prism";
import bear from "~/configs/bear";
import postingCategories, {
  getPostsByCategory,
  getPostsBySubcategory,
  getSubcategories
} from "~/configs/posting";
import { parseMarkdown } from "~/utils/markdown";
import type { BearMdData } from "~/types";
import type { PostingMdData, PostingSubcategory } from "~/types";

interface ContentProps {
  contentID: string;
  contentURL: string;
  onBack?: () => void;
  showBackButton?: boolean;
  breadcrumb?: {
    category?: string;
    subcategory?: string;
    post?: string;
  };
  isPosting?: boolean; // 포스팅 여부 (전체 너비 사용할지 결정)
}

interface MiddlebarProps {
  items: BearMdData[];
  cur: number;
  setContent: (id: string, url: string, index: number) => void;
  isPosting?: boolean;
  onSubCategoryClick?: (categoryId: string, index: number) => void;
}

interface SidebarProps {
  cur: number;
  setMidBar: (items: BearMdData[], index: number) => void;
}

type NavigationLevel = "category" | "subcategory" | "post";

interface NavigationHistory {
  level: NavigationLevel;
  categoryId?: string;
  subcategoryId?: string;
}

interface BearState extends ContentProps {
  curSidebar: number;
  curMidbar: number;
  midbarList: BearMdData[];
  isPosting: boolean;
  postingSubCategory: string | null;
  currentLevel: NavigationLevel;
  currentCategoryId: string | null;
  currentSubcategoryId: string | null;
  history: NavigationHistory[];
}

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

const Sidebar = ({ cur, setMidBar }: SidebarProps) => {
  return (
    <div text-white>
      <div className="h-12 pr-3 hstack space-x-3 justify-end">
        <span className="i-ic:baseline-cloud-off text-xl" />
        <span className="i-akar-icons:settings-vertical text-xl" />
      </div>
      <ul>
        {bear.map((item, index) => {
          const isDisabled = item.md.length === 0;
          return (
            <li
              key={`bear-sidebar-${item.id}`}
              className={`pl-6 h-8 hstack ${
                isDisabled ? "cursor-not-allowed opacity-50" : "cursor-default"
              } ${
                cur === index ? "bg-red-500" : "bg-transparent"
              } ${cur === index ? "" : isDisabled ? "" : "hover:bg-gray-600"}`}
              onClick={() => !isDisabled && setMidBar(item.md, index)}
            >
              <span className={item.icon} />
              <span className="ml-2">{item.title}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const Middlebar = ({
  items,
  cur,
  setContent,
  isPosting,
  onSubCategoryClick
}: MiddlebarProps) => {
  const navigate = useNavigate();

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
          onClick={() => {
            // If posting sub-category (no file), trigger subcategory click
            if (isPosting && !item.file && onSubCategoryClick) {
              onSubCategoryClick(item.id, index);
            } else if (item.file) {
              setContent(item.id, item.file, index);
            }
          }}
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
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
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

const SubcategoryListView = ({
  categoryId,
  onSubcategoryClick
}: {
  categoryId: string;
  onSubcategoryClick: (subcategoryId: string) => void;
}) => {
  const subcategories = getSubcategories(categoryId);
  const category = postingCategories.find((cat) => cat.id === categoryId);

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          {category && <span className={`${category.icon} text-3xl text-red-500`} />}
          <h2 className="text-2xl font-bold text-c-900">
            {category?.title || "Subcategories"}
          </h2>
        </div>
        <p className="text-c-600 text-sm">서브카테고리를 선택하세요.</p>
      </div>

      <div className="space-y-3">
        {subcategories.map((subcategory) => (
          <div
            key={subcategory.id}
            className="relative p-4 rounded-lg border border-c-300 bg-white dark:bg-gray-900 hover:shadow-md hover:border-red-300 transition-all duration-200 cursor-pointer"
            onClick={() => onSubcategoryClick(subcategory.id)}
          >
            <div className="flex items-center gap-3">
              <span className={`${subcategory.icon} text-2xl text-red-500`} />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-c-900">{subcategory.title}</h3>
                <p className="text-xs text-c-600 mt-1">
                  {subcategory.posts.length}개의 포스트
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PostingListView = ({
  categoryId,
  subcategoryId,
  navigate,
  onPostClick
}: {
  categoryId: string;
  subcategoryId?: string;
  navigate: any;
  onPostClick: (post: any) => void;
}) => {
  const posts = subcategoryId
    ? getPostsBySubcategory(categoryId, subcategoryId)
    : getPostsByCategory(categoryId);

  const category = postingCategories.find((cat) => cat.id === categoryId);
  const subcategory = subcategoryId
    ? getSubcategories(categoryId).find((sub) => sub.id === subcategoryId)
    : null;

  const displayTitle = subcategory?.title || category?.title || "Blog Posts";
  const displayIcon = subcategory?.icon || category?.icon;

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          {displayIcon && <span className={`${displayIcon} text-3xl text-red-500`} />}
          <h2 className="text-2xl font-bold text-c-900">{displayTitle}</h2>
        </div>
        <p className="text-c-600 text-sm">포스트를 클릭하여 내용을 확인하세요.</p>
      </div>

      <div className="space-y-3">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-c-500">아직 포스트가 없습니다.</p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="relative p-3 rounded-lg border border-c-300 bg-white dark:bg-gray-900 hover:shadow-md hover:border-red-300 transition-all duration-200 cursor-pointer group"
              onClick={() => onPostClick(post)}
            >
              {/* View in Blog 버튼 - 우측 상단 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/blog/${post.category}/${post.slug}`);
                }}
                className="absolute top-2 right-2 p-1.5 rounded hover:bg-c-200 dark:hover:bg-gray-800 transition-colors opacity-0 group-hover:opacity-100"
                title="새 창에서 보기"
              >
                <span className="i-fa-solid:external-link-alt text-sm text-c-500" />
              </button>

              {/* 포스트 내용 */}
              <div className="flex items-start gap-2 pr-8">
                <span className={`${post.icon} text-lg text-red-500 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-c-900 mb-1 truncate">
                    {post.title}
                  </h3>
                  <p className="text-xs text-c-600 line-clamp-2">{post.excerpt}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const Content = ({
  contentID,
  contentURL,
  onBack,
  showBackButton,
  breadcrumb,
  isPosting
}: ContentProps) => {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const dark = useStore((state) => state.dark);

  useEffect(() => {
    if (!contentURL || !contentID) {
      setContent("");
      return;
    }

    setLoading(true);
    fetch(contentURL)
      .then((response) => response.text())
      .then((text) => {
        console.log("Original text length:", text.length);
        console.log("First 200 chars:", text.substring(0, 200));

        // Parse markdown to remove frontmatter
        const parsed = parseMarkdown(text);

        console.log("Parsed content length:", parsed.content.length);
        console.log("Has frontmatter:", parsed.frontmatter !== null);
        console.log("Parsed first 200 chars:", parsed.content.substring(0, 200));

        setContent(parsed.content);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        setLoading(false);
      });
  }, [contentID, contentURL]);

  // Show placeholder if no content is selected
  if (!contentID || !contentURL) {
    return (
      <div className="w-2/3 mx-auto px-2 py-6 flex items-center justify-center h-full">
        <div className="text-center text-c-500">
          <p className="text-lg">카테고리를 선택하세요</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-2/3 mx-auto px-2 py-6 flex items-center justify-center h-full">
        <div className="text-center text-c-500">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {showBackButton && onBack && (
        <div className="sticky top-0 z-10 px-4 py-3 border-b border-c-300 bg-white dark:bg-gray-900">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-c-200 dark:hover:bg-gray-800 transition-colors text-c-700"
          >
            <span className="i-fa-solid:arrow-left text-sm" />
            <span className="text-sm font-medium">뒤로가기</span>
          </button>
        </div>
      )}
      <div
        className={
          isPosting
            ? "markdown max-w-4xl mx-auto px-20 py-6 text-c-700"
            : "markdown w-2/3 mx-auto px-2 py-6 text-c-700"
        }
      >
        {/* Breadcrumb */}
        {breadcrumb &&
          (breadcrumb.category || breadcrumb.subcategory || breadcrumb.post) && (
            <div className="mb-6 pb-3 border-b border-c-200">
              <div className="flex items-center gap-2 text-sm text-c-600">
                {breadcrumb.category && (
                  <>
                    <span className="font-medium text-c-700">{breadcrumb.category}</span>
                    {(breadcrumb.subcategory || breadcrumb.post) && (
                      <span className="i-fa-solid:chevron-right text-xs" />
                    )}
                  </>
                )}
                {breadcrumb.subcategory && (
                  <>
                    <span className="font-medium text-c-700">
                      {breadcrumb.subcategory}
                    </span>
                    {breadcrumb.post && (
                      <span className="i-fa-solid:chevron-right text-xs" />
                    )}
                  </>
                )}
                {breadcrumb.post && <span className="text-c-500">{breadcrumb.post}</span>}
              </div>
            </div>
          )}

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
                className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              />
            )
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </>
  );
};

const Bear = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<BearState>({
    curSidebar: 0,
    curMidbar: 0,
    midbarList: bear[0].md,
    contentID: bear[0].md[0]?.id || "",
    contentURL: bear[0].md[0]?.file || "",
    isPosting: false,
    postingSubCategory: null,
    currentLevel: "category",
    currentCategoryId: null,
    currentSubcategoryId: null,
    history: []
  });

  const setMidBar = (items: BearMdData[], index: number) => {
    const isPostingCategory = bear[index].id === "posting";

    if (isPostingCategory) {
      // For posting category, check if it has subcategories
      const category = postingCategories.find((cat) => cat.id === items[0]?.id);
      const hasSubcategories =
        category?.subcategories && category.subcategories.length > 0;

      if (hasSubcategories) {
        // Tech category - show subcategory selection
        setState({
          curSidebar: index,
          curMidbar: 0,
          midbarList: items,
          contentID: "",
          contentURL: "",
          isPosting: true,
          postingSubCategory: items[0]?.id, // Auto-select first category (Tech)
          currentLevel: "category",
          currentCategoryId: items[0]?.id,
          currentSubcategoryId: null,
          history: []
        });
      } else {
        // Life or Review - show posts directly
        setState({
          curSidebar: index,
          curMidbar: 0,
          midbarList: items,
          contentID: "",
          contentURL: "",
          isPosting: true,
          postingSubCategory: items[0]?.id,
          currentLevel: "category",
          currentCategoryId: items[0]?.id,
          currentSubcategoryId: null,
          history: []
        });
      }
    } else {
      // Regular categories (About Me, etc.)
      setState({
        curSidebar: index,
        curMidbar: 0,
        midbarList: items,
        contentID: items[0]?.id || "",
        contentURL: items[0]?.file || "",
        isPosting: false,
        postingSubCategory: null,
        currentLevel: "category",
        currentCategoryId: null,
        currentSubcategoryId: null,
        history: []
      });
    }
  };

  const setContent = (id: string, url: string, index: number) => {
    setState({
      ...state,
      curMidbar: index,
      contentID: id,
      contentURL: url
    });
  };

  const handleSubCategoryClick = (categoryId: string, index: number) => {
    // Check if this category has subcategories
    const category = postingCategories.find((cat) => cat.id === categoryId);
    const hasSubcategories = category?.subcategories && category.subcategories.length > 0;

    if (hasSubcategories) {
      // Show subcategory list view (e.g., Tech → React/TypeScript/Rust)
      setState({
        ...state,
        curMidbar: index,
        postingSubCategory: categoryId,
        currentLevel: "category",
        currentCategoryId: categoryId,
        currentSubcategoryId: null,
        contentID: "",
        contentURL: ""
      });
    } else {
      // Show posts directly (e.g., Life or Review)
      setState({
        ...state,
        curMidbar: index,
        postingSubCategory: categoryId,
        currentLevel: "category",
        currentCategoryId: categoryId,
        currentSubcategoryId: null,
        contentID: "",
        contentURL: ""
      });
    }
  };

  const handleSubcategorySelect = (subcategoryId: string) => {
    // User clicked on a subcategory (e.g., React, TypeScript, Rust)
    // Show posts for that subcategory
    setState({
      ...state,
      currentLevel: "subcategory",
      currentSubcategoryId: subcategoryId,
      contentID: "",
      contentURL: "",
      history: [
        ...state.history,
        {
          level: "category",
          categoryId: state.currentCategoryId || undefined,
          subcategoryId: undefined
        }
      ]
    });
  };

  const handlePostClick = (post: any) => {
    // Show the post content in Bear
    setState({
      ...state,
      contentID: post.id,
      contentURL: post.file,
      currentLevel: "post",
      history: [
        ...state.history,
        {
          level: state.currentLevel,
          categoryId: state.currentCategoryId || undefined,
          subcategoryId: state.currentSubcategoryId || undefined
        }
      ]
    });
  };

  const handleBack = () => {
    const previousState = state.history[state.history.length - 1];

    if (!previousState) {
      // No history, reset to category view
      setState({
        ...state,
        currentLevel: "category",
        currentSubcategoryId: null,
        contentID: "",
        contentURL: "",
        history: []
      });
      return;
    }

    // Remove last history entry
    const newHistory = state.history.slice(0, -1);

    if (previousState.level === "subcategory") {
      // Back from post to subcategory post list
      setState({
        ...state,
        currentLevel: "subcategory",
        contentID: "",
        contentURL: "",
        history: newHistory
      });
    } else if (previousState.level === "category") {
      // Back from subcategory to category (subcategory list)
      setState({
        ...state,
        currentLevel: "category",
        currentSubcategoryId: null,
        contentID: "",
        contentURL: "",
        history: newHistory
      });
    } else {
      // Default: back to category
      setState({
        ...state,
        currentLevel: "category",
        currentSubcategoryId: null,
        contentID: "",
        contentURL: "",
        history: newHistory
      });
    }
  };

  // 일반 카테고리(Profile, Projects 등)의 뒤로가기
  const handleBackToMiddlebar = () => {
    setState({
      ...state,
      contentID: "",
      contentURL: ""
    });
  };

  // Determine what to show in the content area
  const renderContentArea = () => {
    // Showing a post (markdown content)
    if (state.currentLevel === "post" && state.contentID && state.contentURL) {
      // Build breadcrumb for the post
      const breadcrumb: { category?: string; subcategory?: string; post?: string } = {};

      if (state.currentCategoryId) {
        const category = postingCategories.find(
          (cat) => cat.id === state.currentCategoryId
        );
        breadcrumb.category = category?.title;

        if (state.currentSubcategoryId && category?.subcategories) {
          const subcategory = category.subcategories.find(
            (sub) => sub.id === state.currentSubcategoryId
          );
          breadcrumb.subcategory = subcategory?.title;

          // Find post title
          const post = subcategory?.posts.find((p) => p.id === state.contentID);
          breadcrumb.post = post?.title;
        } else if (category?.posts) {
          // No subcategory (Life or Review)
          const post = category.posts.find((p) => p.id === state.contentID);
          breadcrumb.post = post?.title;
        }
      }

      return (
        <Content
          contentID={state.contentID}
          contentURL={state.contentURL}
          onBack={handleBack}
          showBackButton={true}
          breadcrumb={breadcrumb}
          isPosting={true}
        />
      );
    }

    // Showing posts from a subcategory (e.g., React posts)
    if (
      state.currentLevel === "subcategory" &&
      state.currentCategoryId &&
      state.currentSubcategoryId
    ) {
      return (
        <>
          <div className="sticky top-0 z-10 px-4 py-3 border-b border-c-300 bg-white dark:bg-gray-900">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-c-200 dark:hover:bg-gray-800 transition-colors text-c-700"
            >
              <span className="i-fa-solid:arrow-left text-sm" />
              <span className="text-sm font-medium">뒤로가기</span>
            </button>
          </div>
          <PostingListView
            categoryId={state.currentCategoryId}
            subcategoryId={state.currentSubcategoryId}
            navigate={navigate}
            onPostClick={handlePostClick}
          />
        </>
      );
    }

    // Showing category level
    if (state.currentLevel === "category" && state.currentCategoryId) {
      const category = postingCategories.find(
        (cat) => cat.id === state.currentCategoryId
      );
      const hasSubcategories =
        category?.subcategories && category.subcategories.length > 0;

      if (hasSubcategories) {
        // Show subcategory selection (e.g., Tech → React/TypeScript/Rust)
        return (
          <SubcategoryListView
            categoryId={state.currentCategoryId}
            onSubcategoryClick={handleSubcategorySelect}
          />
        );
      } else {
        // Show posts directly (e.g., Life or Review)
        return (
          <PostingListView
            categoryId={state.currentCategoryId}
            navigate={navigate}
            onPostClick={handlePostClick}
          />
        );
      }
    }

    // Default: show regular content (non-posting categories like About Me)
    return (
      <Content
        contentID={state.contentID}
        contentURL={state.contentURL}
        showBackButton={false}
        isPosting={false}
      />
    );
  };

  // 포스팅 포스트를 볼 때만 middlebar를 숨김
  const hideMiddlebar =
    state.currentLevel === "post" && state.contentID && state.contentURL;

  return (
    <div className="bear font-avenir flex h-full">
      <div className="w-44 flex-shrink-0 overflow-auto bg-gray-700">
        <Sidebar cur={state.curSidebar} setMidBar={setMidBar} />
      </div>
      {!hideMiddlebar && (
        <div
          className="w-60 flex-shrink-0 overflow-auto"
          bg="gray-50 dark:gray-800"
          border="r c-300"
        >
          <Middlebar
            items={state.midbarList}
            cur={state.curMidbar}
            setContent={setContent}
            isPosting={state.isPosting}
            onSubCategoryClick={handleSubCategoryClick}
          />
        </div>
      )}
      <div className="flex-1 overflow-auto" bg="gray-50 dark:gray-800">
        {renderContentArea()}
      </div>
    </div>
  );
};

export default Bear;
