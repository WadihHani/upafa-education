import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Entry = {
  title: string | null;
  content: string | null;
  image_url: string | null;
  link_url: string | null;
};
type SiteContentMap = Record<string, Entry>;

let cache: SiteContentMap | null = null;
const listeners = new Set<(m: SiteContentMap) => void>();

async function load() {
  const { data: rows } = await (supabase as any)
    .from("site_content")
    .select("section_key, title, content, image_url, link_url");
  const map: SiteContentMap = {};
  rows?.forEach((r: any) => {
    map[r.section_key] = {
      title: r.title,
      content: r.content,
      image_url: r.image_url,
      link_url: r.link_url,
    };
  });
  cache = map;
  listeners.forEach((cb) => cb(map));
  return map;
}

export function useSiteContent() {
  const [data, setData] = useState<SiteContentMap>(cache || {});
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    const cb = (m: SiteContentMap) => setData(m);
    listeners.add(cb);
    if (!cache) load().finally(() => setLoading(false));
    else setLoading(false);
    return () => {
      listeners.delete(cb);
    };
  }, []);

  const get = (key: string, fallback = "") => data[key]?.content || fallback;
  const getTitle = (key: string, fallback = "") => data[key]?.title || fallback;
  const getImage = (key: string, fallback = "") => data[key]?.image_url || fallback;
  const getLink = (key: string, fallback = "") => data[key]?.link_url || fallback;

  return { data, loading, get, getTitle, getImage, getLink };
}

export function clearSiteContentCache() {
  cache = null;
  load();
}
