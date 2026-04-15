import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type SiteContentMap = Record<string, { title: string | null; content: string | null }>;

let cache: SiteContentMap | null = null;

export function useSiteContent() {
  const [data, setData] = useState<SiteContentMap>(cache || {});
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) return;
    supabase
      .from("site_content")
      .select("section_key, title, content")
      .then(({ data: rows }) => {
        const map: SiteContentMap = {};
        rows?.forEach((r: any) => {
          map[r.section_key] = { title: r.title, content: r.content };
        });
        cache = map;
        setData(map);
        setLoading(false);
      });
  }, []);

  const get = (key: string, fallback = "") => data[key]?.content || fallback;
  const getTitle = (key: string, fallback = "") => data[key]?.title || fallback;

  return { data, loading, get, getTitle };
}

// Clear cache when admin updates content
export function clearSiteContentCache() {
  cache = null;
}
