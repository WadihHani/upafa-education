import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Newspaper } from "lucide-react";
import { getNewsIcon } from "@/lib/news-icons";

type Category = {
  id: string;
  key: string;
  title: string;
  icon_name: string;
  is_highlighted: boolean;
};

type Props = {
  /** When true, the active category (matching :categoryKey) is visually emphasized. */
  highlightActive?: boolean;
  /** When true, applies sticky positioning so the list stays visible while scrolling. */
  sticky?: boolean;
  /** Optional className for the outer wrapper. */
  className?: string;
};

export default function NewsCategoriesSidebar({
  highlightActive = false,
  sticky = false,
  className = "",
}: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const params = useParams<{ categoryKey?: string }>();
  const activeKey = params.categoryKey;

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("news_categories")
        .select("id,key,title,icon_name,is_highlighted")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      setCategories(data ?? []);
    })();
  }, []);

  const wrapperClasses = [
    "w-full",
    sticky ? "lg:sticky lg:top-24 lg:self-start" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <aside className={wrapperClasses} aria-label="آخر الأخبار" dir="rtl">
      <div className="bg-primary text-primary-foreground rounded-md px-4 py-3 flex items-center justify-between shadow-md">
        <span className="font-bold text-sm">آخر الأخبار</span>
        <Newspaper size={18} className="opacity-80" />
      </div>

      <ul className="mt-2 space-y-1.5">
        {categories.length === 0
          ? Array.from({ length: 6 }).map((_, i) => (
              <li
                key={i}
                className="h-11 bg-muted/50 rounded-md animate-pulse"
              />
            ))
          : categories.map((c) => {
              const Icon = getNewsIcon(c.icon_name);
              const target = c.key === "mofadla" ? "/mofadla" : `/news/${c.key}`;
              const isActive = highlightActive && activeKey === c.key;
              const highlighted = c.is_highlighted || isActive;

              return (
                <li key={c.id}>
                  <Link
                    to={target}
                    className={`group flex items-center justify-between gap-3 rounded-md px-4 py-2.5 text-sm font-medium transition shadow-sm ${
                      highlighted
                        ? "bg-accent text-accent-foreground font-bold hover:brightness-110"
                        : "bg-card border border-border text-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    <span className="text-right flex-1 leading-tight">{c.title}</span>
                    <Icon
                      size={16}
                      className={`shrink-0 ${highlighted ? "" : "text-muted-foreground"}`}
                    />
                  </Link>
                </li>
              );
            })}
      </ul>
    </aside>
  );
}
