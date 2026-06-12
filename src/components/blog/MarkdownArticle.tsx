import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeExternalLinks from "rehype-external-links";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula, prism } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MarkdownArticleProps {
  content: string;
  className?: string;
  /** 미지정 시 전역(macOS) 다크 상태를 따른다 — 블로그는 로컬 테마를 명시로 넘김 */
  dark?: boolean;
}

// 자주 쓰는 축약 언어명 → Prism 정식 명칭
const LANGUAGE_ALIASES: Record<string, string> = {
  ts: "typescript",
  js: "javascript",
  py: "python",
  rs: "rust",
  kt: "kotlin",
  sh: "bash",
  zsh: "bash",
  shell: "bash",
  yml: "yaml",
  md: "markdown",
  html: "markup",
  xml: "markup",
  svg: "markup",
  vue: "markup",
  dockerfile: "docker"
};

// 옵시디언 콜아웃 타입별 아이콘·라벨 (모르는 타입은 note로 폴백)
const CALLOUT_META: Record<string, { icon: string; label: string }> = {
  note: { icon: "✏️", label: "Note" },
  tip: { icon: "💡", label: "Tip" },
  hint: { icon: "💡", label: "Tip" },
  info: { icon: "ℹ️", label: "Info" },
  todo: { icon: "☑️", label: "Todo" },
  warning: { icon: "⚠️", label: "Warning" },
  caution: { icon: "⚠️", label: "Warning" },
  danger: { icon: "🛑", label: "Danger" },
  error: { icon: "🛑", label: "Danger" },
  question: { icon: "❓", label: "Question" },
  example: { icon: "📎", label: "Example" },
  quote: { icon: "❝", label: "Quote" },
  abstract: { icon: "📋", label: "Abstract" },
  summary: { icon: "📋", label: "Summary" },
  success: { icon: "✅", label: "Success" }
};

// 코드 펜스/인라인 코드 안은 건드리지 않고 옵시디언 전용 문법을 변환한다.
// - ==하이라이트== → <mark>
// - > [!type] 제목 → 인용 첫 줄을 콜아웃 배지로 (blockquote 스타일은 CSS :has로 분기)
const transformObsidianSyntax = (markdown: string): string => {
  const segments = markdown.split(/(```[\s\S]*?```|`[^`\n]*`)/g);

  return segments
    .map((segment, index) => {
      if (index % 2 === 1) return segment;

      return segment
        .replace(/==([^=\n]+)==/g, "<mark>$1</mark>")
        .replace(
          /^([ \t]*>[ \t]*)\[!(\w+)\][+-]?[ \t]*(.*)$/gm,
          (_, prefix, rawType, title) => {
            const type = rawType.toLowerCase();
            const meta = CALLOUT_META[type] ?? CALLOUT_META.note;
            const variant = CALLOUT_META[type] ? type : "note";
            const heading = title.trim() || meta.label;
            return `${prefix}<span class="callout-badge callout-${variant}">${meta.icon} ${heading}</span>`;
          }
        );
    })
    .join("");
};

const buildComponents = (dark: boolean): Components => ({
  a: ({ node, href, children, ...props }) => (
    <a {...props} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  img: ({ src, alt, ...props }) => (
    <img {...props} src={src} alt={alt ?? ""} loading="lazy" />
  ),
  // 코드블록 래퍼는 아래 code 쪽 SyntaxHighlighter가 담당
  pre: ({ children }) => <>{children}</>,
  code: ({ node, className, children, ...props }) => {
    const raw = String(children);
    const match = /language-([\w-]+)/.exec(className ?? "");
    // 펜스 블록은 항상 개행을 포함한다 — 개행 없으면 인라인 코드
    if (!match && !raw.includes("\n")) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }

    const language = match
      ? LANGUAGE_ALIASES[match[1].toLowerCase()] ?? match[1].toLowerCase()
      : "text";

    return (
      <SyntaxHighlighter
        style={dark ? dracula : prism}
        language={language}
        PreTag="div"
        className="blog-codeblock"
        codeTagProps={{ style: { fontFamily: "var(--blog-mono)" } }}
      >
        {raw.replace(/\n$/, "")}
      </SyntaxHighlighter>
    );
  }
});

export default function MarkdownArticle({
  content,
  className = "",
  dark
}: MarkdownArticleProps) {
  const globalDark = useStore((state) => state.dark);
  const isDark = dark ?? Boolean(globalDark);

  return (
    <div className={`markdown ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        remarkRehypeOptions={{
          footnoteLabel: "각주",
          footnoteBackLabel: "본문으로 돌아가기"
        }}
        rehypePlugins={[
          rehypeRaw,
          rehypeKatex,
          [rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] }]
        ]}
        components={buildComponents(isDark)}
      >
        {transformObsidianSyntax(content)}
      </ReactMarkdown>
    </div>
  );
}
