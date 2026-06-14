import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type PageSeo = {
  path: string;
  title: string | null;
  description: string | null;
  og_image_url: string | null;
  noindex: boolean;
};

let cache: Record<string, PageSeo> | null = null;
const listeners = new Set<() => void>();

async function load() {
  const { data } = await (supabase as any).from("page_seo").select("*");
  const map: Record<string, PageSeo> = {};
  (data || []).forEach((r: any) => (map[r.path] = r));
  cache = map;
  listeners.forEach((cb) => cb());
}

export function usePageSeo(path: string) {
  const [, force] = useState(0);
  useEffect(() => {
    const cb = () => force((n) => n + 1);
    listeners.add(cb);
    if (!cache) load();
    return () => {
      listeners.delete(cb);
    };
  }, []);
  return cache?.[path] || null;
}

export function clearPageSeoCache() {
  cache = null;
  load();
}
