// Runs before `vite dev` and `vite build`; writes public/sitemap.xml.
import { writeFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "https://upafa.education";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface Entry {
  path: string;
  changefreq?: string;
  priority?: string;
  lastmod?: string;
}

const staticEntries: Entry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.8" },
  { path: "/programs", changefreq: "monthly", priority: "0.8" },
  { path: "/programs/bachelor", changefreq: "monthly", priority: "0.8" },
  { path: "/programs/masters", changefreq: "monthly", priority: "0.8" },
  { path: "/programs/phd", changefreq: "monthly", priority: "0.8" },
  { path: "/faculties", changefreq: "monthly", priority: "0.7" },
  { path: "/tuition", changefreq: "monthly", priority: "0.7" },
  { path: "/tuition-fees", changefreq: "monthly", priority: "0.7" },
  { path: "/faq", changefreq: "monthly", priority: "0.6" },
  { path: "/publications", changefreq: "monthly", priority: "0.6" },
  { path: "/conferences", changefreq: "monthly", priority: "0.6" },
  { path: "/contact", changefreq: "monthly", priority: "0.7" },
  { path: "/mofadla", changefreq: "weekly", priority: "0.8" },
  { path: "/mofadla/apply", changefreq: "weekly", priority: "0.7" },
  { path: "/portal", changefreq: "monthly", priority: "0.5" },
];

async function fetchDynamic(): Promise<Entry[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const entries: Entry[] = [];
    const { data: cats } = await supabase
      .from("news_categories")
      .select("key")
      .eq("is_active", true);
    for (const c of cats ?? []) {
      entries.push({ path: `/news/${c.key}`, changefreq: "weekly", priority: "0.6" });
    }
    const { data: posts } = await supabase
      .from("news_posts")
      .select("id, published_at, category_id, news_categories(key)")
      .eq("is_published", true);
    for (const p of (posts as any[]) ?? []) {
      const key = p.news_categories?.key;
      if (!key) continue;
      entries.push({
        path: `/news/${key}/${p.id}`,
        changefreq: "monthly",
        priority: "0.5",
        lastmod: p.published_at?.split("T")[0],
      });
    }
    return entries;
  } catch (e) {
    console.warn("sitemap: skipping dynamic entries –", (e as Error).message);
    return [];
  }
}

function render(entries: Entry[]) {
  const urls = entries.map((e) =>
    [
      "  <url>",
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      "  </url>",
    ].filter(Boolean).join("\n")
  );
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

(async () => {
  const dyn = await fetchDynamic();
  const all = [...staticEntries, ...dyn];
  writeFileSync(resolve("public/sitemap.xml"), render(all));
  console.log(`sitemap.xml written (${all.length} entries)`);
})();
