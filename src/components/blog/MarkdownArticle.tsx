import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeExternalLinks from "rehype-external-links";

interface MarkdownArticleProps {
  content: string;
  className?: string;
}

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

interface MarkdownLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  node?: unknown;
}

const components: Components = {
  a: ({
    node,
    href,
    children,
    ...props
  }: MarkdownLinkProps & { children?: React.ReactNode }) => (
    <a {...props} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  img: ({ src, alt, ...props }) => (
    <img {...props} src={src} alt={alt ?? ""} loading="lazy" />
  )
};

export default function MarkdownArticle({
  content,
  className = ""
}: MarkdownArticleProps) {
  return (
    <div className={`markdown ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeRaw,
          rehypeKatex,
          [rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] }]
        ]}
        components={components}
      >
        {transformObsidianSyntax(content)}
      </ReactMarkdown>
    </div>
  );
}
