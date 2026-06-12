import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeExternalLinks from "rehype-external-links";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MarkdownArticleProps {
  content: string;
  className?: string;
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

// 옵시디언 콜아웃 타입별 낙관 도장(한자 한 자) + 한글 라벨 (모르는 타입은 note로 폴백)
const CALLOUT_META: Record<string, { stamp: string; label: string }> = {
  note: { stamp: "註", label: "메모" },
  tip: { stamp: "訣", label: "팁" },
  hint: { stamp: "訣", label: "팁" },
  info: { stamp: "報", label: "정보" },
  todo: { stamp: "課", label: "할 일" },
  warning: { stamp: "警", label: "주의" },
  caution: { stamp: "警", label: "주의" },
  danger: { stamp: "危", label: "위험" },
  error: { stamp: "危", label: "위험" },
  question: { stamp: "問", label: "질문" },
  example: { stamp: "例", label: "예시" },
  quote: { stamp: "引", label: "인용" },
  abstract: { stamp: "要", label: "요약" },
  summary: { stamp: "要", label: "요약" },
  success: { stamp: "成", label: "완료" }
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
            return `${prefix}<span class="callout-badge callout-${variant}"><span class="callout-stamp">${meta.stamp}</span>${heading}</span>`;
          }
        );
    })
    .join("");
};

const markdownComponents: Components = {
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

    // 테마 무관 "밤 창문" — 종이 본문에 네온 토큰이 켜진 먹색 블록
    return (
      <div className="blog-codewrap" data-language={language === "text" ? "" : language}>
        <SyntaxHighlighter
          style={dracula}
          language={language}
          PreTag="div"
          className="blog-codeblock"
          codeTagProps={{ style: { fontFamily: "var(--blog-mono)" } }}
        >
          {raw.replace(/\n$/, "")}
        </SyntaxHighlighter>
      </div>
    );
  }
};

export default function MarkdownArticle({
  content,
  className = ""
}: MarkdownArticleProps) {
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
        components={markdownComponents}
      >
        {transformObsidianSyntax(content)}
      </ReactMarkdown>
    </div>
  );
}
