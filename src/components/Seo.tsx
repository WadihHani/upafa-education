import { Helmet } from "react-helmet-async";
import { usePageSeo } from "@/hooks/use-page-seo";

interface SeoProps {
  title: string;
  description: string;
  path: string;
  ogType?: "website" | "article";
  image?: string;
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
  // Overrides from DB (page_seo table) take priority
  const override = usePageSeo(path);
  const finalTitle = override?.title || title;
  const finalDesc = override?.description || description;
  const finalImage = override?.og_image_url || image;
  const finalNoindex = override?.noindex ?? noindex;

  const url = `${SITE}${path}`;
  const ogImage = finalImage
    ? finalImage.startsWith("http")
      ? finalImage
      : `${SITE}${finalImage.startsWith("/") ? "" : "/"}${finalImage}`
    : DEFAULT_OG_IMAGE;
  const ldArray = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  return (
    <Helmet>
      <html lang="ar" dir="rtl" />
      <title>{finalTitle}</title>
      <meta name="description" content={finalDesc} />
      <link rel="canonical" href={url} />
      {finalNoindex && <meta name="robots" content="noindex,nofollow" />}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDesc} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="ar_AR" />
      <meta property="og:site_name" content="UPAFA Syria" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDesc} />
      <meta name="twitter:image" content={ogImage} />
      {ldArray.map((ld, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(ld)}</script>
      ))}
    </Helmet>
  );
}
