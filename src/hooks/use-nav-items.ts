import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type NavItem = {
  id: string;
  location: string;
  parent_id: string | null;
  label: string;
  href: string;
  sort_order: number;
  is_active: boolean;
  children?: NavItem[];
};

let cache: NavItem[] | null = null;
const listeners = new Set<(items: NavItem[]) => void>();

async function load() {
  const { data } = await (supabase as any)
    .from("nav_items")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  const items = (data as NavItem[]) || [];
  cache = items;
  listeners.forEach((cb) => cb(items));
  return items;
}

export function useNavItems(location?: string) {
  const [items, setItems] = useState<NavItem[]>(cache || []);

  useEffect(() => {
    const cb = (m: NavItem[]) => setItems(m);
    listeners.add(cb);
    if (!cache) load();
    return () => {
      listeners.delete(cb);
    };
  }, []);

  const filtered = location ? items.filter((i) => i.location === location) : items;
  // Build tree
  const roots = filtered.filter((i) => !i.parent_id);
  const tree = roots.map((r) => ({
    ...r,
    children: items.filter((c) => c.parent_id === r.id).sort((a, b) => a.sort_order - b.sort_order),
  }));
  return tree;
}

export function clearNavCache() {
  cache = null;
  load();
}
