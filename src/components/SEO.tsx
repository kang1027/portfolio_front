import { Helmet, HelmetProvider } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  url?: string;
  canonical?: string;
  keywords?: string;
  type?: "website" | "article";
  publishedTime?: string;
  tags?: string[];
  jsonLd?: Record<string, unknown>;
}

export function SEOProvider({ children }: { children: React.ReactNode }) {
  return <HelmetProvider>{children}</HelmetProvider>;
}

export default function SEO({
  title = "kang1027's Portfolio",
  description = "kang1027's portfolio in macOS style. default design is forked by https://github.com/Renovamen/playground-macos",
  image = "https://www.kang1027.com/screenshots/light.png",
  imageAlt = `${title} Preview`,
  imageWidth = 1200,
  imageHeight = 630,
  url = "https://www.kang1027.com/",
  canonical = url,
  keywords = "portfolio, developer, macOS, kang1027, web development",
  type = "website",
  publishedTime,
  tags = [],
  jsonLd
}: SEOProps) {
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content={String(imageWidth)} />
      <meta property="og:image:height" content={String(imageHeight)} />
      <meta property="og:image:alt" content={imageAlt} />
      <meta property="og:locale" content="ko_KR" />
      <meta property="og:site_name" content="kang1027's Portfolio" />
      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {tags.map((tag) => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}
