import { Helmet, HelmetProvider } from "react-helmet-async";

interface BlogPostSchema {
  title: string;
  description: string;
  date: string;
  author?: string;
  url: string;
  image?: string;
  tags?: string[];
}

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  keywords?: string;
  type?: "website" | "article";
  blogPost?: BlogPostSchema;
}

export function SEOProvider({ children }: { children: React.ReactNode }) {
  return <HelmetProvider>{children}</HelmetProvider>;
}

export default function SEO({
  title = "kang1027's Portfolio",
  description = "kang1027's portfolio in macOS style. default design is forked by https://github.com/Renovamen/playground-macos",
  image = "https://www.kang1027.com/screenshots/light.png",
  url = "https://www.kang1027.com/",
  keywords = "portfolio, developer, macOS, kang1027, web development",
  type = "website",
  blogPost
}: SEOProps) {
  const generateBlogPostSchema = () => {
    if (!blogPost) return null;

    const schema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: blogPost.title,
      description: blogPost.description,
      datePublished: blogPost.date,
      author: {
        "@type": "Person",
        name: blogPost.author || "Kang"
      },
      publisher: {
        "@type": "Person",
        name: "Kang",
        url: "https://www.kang1027.com"
      },
      url: blogPost.url,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": blogPost.url
      },
      ...(blogPost.image && {
        image: {
          "@type": "ImageObject",
          url: blogPost.image
        }
      }),
      ...(blogPost.tags && {
        keywords: blogPost.tags.join(", ")
      })
    };

    return JSON.stringify(schema);
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type === "article" ? "article" : "website"} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${title} Preview`} />
      <meta property="og:locale" content="ko_KR" />
      <meta property="og:site_name" content="kang1027's Portfolio" />
      {blogPost && <meta property="article:published_time" content={blogPost.date} />}
      {blogPost?.author && <meta property="article:author" content={blogPost.author} />}
      {blogPost?.tags && blogPost.tags.map(tag => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* JSON-LD Structured Data */}
      {blogPost && (
        <script type="application/ld+json">
          {generateBlogPostSchema()}
        </script>
      )}
    </Helmet>
  );
}
