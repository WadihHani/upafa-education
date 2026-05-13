import { Helmet } from "react-helmet-async";

interface SeoProps {
  title: string;
  description: string;
  path: string; // e.g. "/about"
  ogType?: "website" | "article";
  image?: string; // absolute or root-relative URL
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
}

const SITE = "https://upafa.education";
const DEFAULT_OG_IMAGE = `${SITE}/og-image.jpg`;

export default function Seo({
  title,
  description,
  path,
  ogType = "website",
  image,
  jsonLd,
  noindex = false,
}: SeoProps) {
  const url = `${SITE}${path}`;
  const ogImage = image
    ? image.startsWith("http")
      ? image
      : `${SITE}${image.startsWith("/") ? "" : "/"}${image}`
    : DEFAULT_OG_IMAGE;
  const ldArray = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  return (
    <Helmet>
      <html lang="ar" dir="rtl" />
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="ar_AR" />
      <meta property="og:site_name" content="UPAFA Syria" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {ldArray.map((ld, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(ld)}</script>
      ))}
    </Helmet>
  );
}
