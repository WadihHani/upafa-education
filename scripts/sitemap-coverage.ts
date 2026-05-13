// Compares routes declared in src/App.tsx with entries in public/sitemap.xml.
// Dynamic routes (e.g. /programs/:level, /news/:categoryKey/:postId) are
// expanded against Supabase data so each real row must appear in the sitemap.
//
// Public-only: private routes (admin, portal, login, transactional) are
// intentionally excluded — they should NOT be in the sitemap.
import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Routes that must NEVER be in the sitemap (auth, admin, portals, transactional).
// `/portal` itself is the public login landing — only nested portal routes are private.
const PRIVATE_PREFIXES = ["/admin", "/portal/", "/login", "/admin/login", "/unsubscribe"];

// Walk <Route> tags tracking nesting so children inherit the parent path prefix.
// A self-closing <Route .../> does not open a scope; <Route ...>...</Route> does.
export function extractRoutesFromApp(src: string): string[] {
  const out = new Set<string>();
  const stack: string[] = [""];
  const tagRe = /<Route\b([^>]*)>|<\/Route>/g;
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(src)) !== null) {
    if (m[0] === "</Route>") { stack.pop(); continue; }
    const rawAttrs = m[1];
    const selfClose = /\/\s*$/.test(rawAttrs);
    const attrs = rawAttrs.replace(/\/\s*$/, "");
    const pathMatch = /\bpath=["']([^"']+)["']/.exec(attrs);
    const parent = stack[stack.length - 1] ?? "";
    let full = parent;
    if (pathMatch) {
      const p = pathMatch[1];
      if (p !== "*") {
        full = (parent.replace(/\/$/, "") + "/" + p.replace(/^\//, "")).replace(/\/+/g, "/");
        if (!full.startsWith("/")) full = "/" + full;
        out.add(full);
      }
    }
    if (!selfClose) stack.push(full);
  }
  return [...out];
}

export function isPrivate(path: string): boolean {
  return PRIVATE_PREFIXES.some((pre) => path === pre.replace(/\/$/, "") || path.startsWith(pre));
}

async function expandDynamic(path: string): Promise<string[]> {
  if (!path.includes(":")) return [path];

  // /programs/:level → fixed enum
  if (path === "/programs/:level") {
    return ["/programs/bachelor", "/programs/masters", "/programs/phd"];
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  if (path === "/news/:categoryKey") {
    const { data } = await supabase.from("news_categories").select("key").eq("is_active", true);
    return (data ?? []).map((c: any) => `/news/${c.key}`);
  }
  if (path === "/news/:categoryKey/:postId") {
    const { data } = await supabase
      .from("news_posts")
      .select("id, news_categories(key)")
      .eq("is_published", true);
    return (data as any[] ?? [])
      .filter((p) => p.news_categories?.key)
      .map((p) => `/news/${p.news_categories.key}/${p.id}`);
  }
  // Unknown dynamic route → caller will flag as missing expansion rule.
  return [];
}

function parseSitemap(xml: string): string[] {
  const re = /<loc>([^<]+)<\/loc>/g;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    try {
      out.push(new URL(m[1]).pathname);
    } catch {
      out.push(m[1]);
    }
  }
  return out;
}

export interface CoverageReport {
  missing: string[]; // public routes not in sitemap
  leaked: string[]; // private routes that ended up in sitemap
  unexpandedDynamic: string[]; // dynamic routes we didn't know how to expand
  totalRoutes: number;
  totalSitemap: number;
}

export async function computeCoverage(): Promise<CoverageReport> {
  const appSrc = readFileSync(resolve("src/App.tsx"), "utf8");
  const sitemap = readFileSync(resolve("public/sitemap.xml"), "utf8");

  const declared = extractRoutesFromApp(appSrc);
  const sitemapPaths = new Set(parseSitemap(sitemap));

  const expectedPublic = new Set<string>();
  const unexpandedDynamic: string[] = [];

  for (const route of declared) {
    if (isPrivate(route)) continue;
    if (route.includes(":")) {
      const expanded = await expandDynamic(route);
      if (expanded.length === 0) unexpandedDynamic.push(route);
      expanded.forEach((e) => expectedPublic.add(e));
    } else {
      expectedPublic.add(route);
    }
  }

  const missing = [...expectedPublic].filter((p) => !sitemapPaths.has(p));
  const leaked = [...sitemapPaths].filter((p) => {
    const route = declared.find((r) => r === p || (r.includes(":") && pathMatchesPattern(p, r)));
    return route ? isPrivate(route) : false;
  });

  return {
    missing,
    leaked,
    unexpandedDynamic,
    totalRoutes: expectedPublic.size,
    totalSitemap: sitemapPaths.size,
  };
}

function pathMatchesPattern(path: string, pattern: string): boolean {
  const re = new RegExp("^" + pattern.replace(/:[^/]+/g, "[^/]+") + "$");
  return re.test(path);
}

// CLI entry: exit non-zero on mismatch.
if (import.meta.url === `file://${process.argv[1]}`) {
  computeCoverage().then((r) => {
    console.log(`Routes (public, expanded): ${r.totalRoutes}`);
    console.log(`Sitemap entries: ${r.totalSitemap}`);
    if (r.unexpandedDynamic.length) {
      console.warn("Dynamic routes with no expansion rule:", r.unexpandedDynamic);
    }
    if (r.missing.length) {
      console.error("MISSING from sitemap:", r.missing);
    }
    if (r.leaked.length) {
      console.error("PRIVATE routes leaked into sitemap:", r.leaked);
    }
    if (r.missing.length || r.leaked.length) process.exit(1);
    console.log("✓ sitemap coverage OK");
  });
}
