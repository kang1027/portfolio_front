import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeExternalLinks from "rehype-external-links";

interface MarkdownArticleProps {
  content: string;
  className?: string;
}

const components: Components = {
  a: ({ href, children, ...props }) => (
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
          rehypeKatex,
          [rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] }]
        ]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
